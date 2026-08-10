// Motor de presupuesto: calcula el "Disponible real" y el ritmo de gasto.

import { addDays, daysBetween, hoy, ymd, type ISODate } from "./dates";
import type { Period } from "./periods";
import { periodContains, periodProgress } from "./periods";
import { transportPlan, transportRemaining, type TransportConfig } from "./transport";
import type { Debt, Expense, FixedExpense, Goal } from "./types";

export interface BudgetInput {
  period: Period;
  salary: number;
  expenses: Expense[]; // todos; se filtran por periodo
  fixed: FixedExpense[];
  goals: Goal[];
  debts: Debt[];
  transport: TransportConfig;
  ref?: Date; // "hoy" simulable para tests
}

export interface BudgetResult {
  salary: number;
  /** Gastos ya registrados en el periodo (incluye buses y cuotas ya pagadas). */
  spent: number;
  /** Gastos fijos que aplican al periodo. */
  fixedTotal: number;
  /** Transporte que aún falta por gastar (reservado). */
  transportReserved: number;
  /** Costo total de transporte planeado del periodo. */
  transportPlanned: number;
  /** Aporte de metas comprometido este periodo (sugerido, aún no aportado). */
  savingsCommitted: number;
  /** Cuotas de deuda que vencen en el periodo y aún no se han pagado. */
  debtDue: number;
  /** EL NÚMERO HÉROE. */
  available: number;
  /** Cuánto se puede gastar por día con lo que queda. */
  perDaySafe: number;
  /** Días que faltan del periodo (incluye hoy). */
  daysLeft: number;
}

/** ¿Un gasto fijo aplica a este periodo? */
function fixedApplies(f: FixedExpense, period: Period): boolean {
  if (f.when === "ambas") return true;
  if (f.when === "primera") return period.payday === 5;
  return period.payday === 20;
}

/** Cuota de una meta por quincena para llegar al objetivo antes del deadline. */
export function goalPerPeriod(goal: Goal, from: Date = hoy()): number {
  const restante = Math.max(0, goal.target - goal.saved);
  if (restante <= 0) return 0;
  if (!goal.deadline) return 0;
  const end = new Date(goal.deadline + "T12:00:00");
  const dias = daysBetween(from, end);
  if (dias <= 0) return restante; // ya venció: todo de una
  const quincenas = Math.max(1, Math.ceil(dias / 15));
  return Math.ceil(restante / quincenas);
}

/** ¿La deuda se paga en este periodo? (según la quincena que el usuario eligió) */
export function debtBelongsToPeriod(debt: Debt, period: Period): boolean {
  const target = debt.payPeriod === "primera" ? 5 : 20;
  return period.payday === target;
}

/** Monto de la cuota que hay que reservar en este periodo (0 si no aplica o ya se pagó). */
export function debtDueInPeriod(debt: Debt, period: Period): number {
  const remaining = debt.totalInstallments - debt.paidInstallments;
  if (remaining <= 0) return 0;
  if (!debtBelongsToPeriod(debt, period)) return 0;
  // ¿Ya se pagó una cuota dentro de este mismo periodo?
  const yaPagada = debt.history.some(
    (h) => h.date >= ymd(period.start) && h.date <= ymd(period.end),
  );
  return yaPagada ? 0 : debt.installmentValue;
}

export function computeBudget(input: BudgetInput): BudgetResult {
  const { period, salary, expenses, fixed, goals, debts, transport } = input;
  const ref = input.ref ?? hoy();

  const inPeriod = expenses.filter((e) => periodContains(period, e.date));
  const spent = inPeriod.reduce((s, e) => s + e.amount, 0);

  const fixedTotal = fixed
    .filter((f) => fixedApplies(f, period))
    .reduce((s, f) => s + f.amount, 0);

  const plan = transportPlan(period, transport);
  const transportPlanned = plan.totalCost;
  // Lo ya gastado en buses (source bus) no se reserva de nuevo:
  const busSpent = inPeriod
    .filter((e) => e.source === "bus")
    .reduce((s, e) => s + e.amount, 0);
  const transportReserved = Math.max(0, transportRemaining(plan, ref).cost);

  const savingsCommitted = goals.reduce((s, g) => s + goalPerPeriod(g, ref), 0);

  const debtDue = debts.reduce((s, d) => s + debtDueInPeriod(d, period), 0);

  // spent ya incluye busSpent y cuotas pagadas; reservamos solo lo pendiente.
  // Evitamos doble conteo del transporte: reservado = futuro, spent = pasado.
  void busSpent;

  const available =
    salary - spent - fixedTotal - transportReserved - savingsCommitted - debtDue;

  const { remaining } = periodProgress(period, ref);
  const daysLeft = Math.max(1, remaining);
  const perDaySafe = Math.max(0, Math.floor(available / daysLeft));

  return {
    salary,
    spent,
    fixedTotal,
    transportReserved,
    transportPlanned,
    savingsCommitted,
    debtDue,
    available,
    perDaySafe,
    daysLeft,
  };
}

export interface PaceResult {
  /** Promedio gastado por día transcurrido (solo gasto "libre", sin buses/cuotas). */
  dailyRate: number;
  /** Cuánto se puede gastar por día para que alcance. */
  dailyBudget: number;
  /** true si va gastando más rápido de lo que aguanta. */
  overpacing: boolean;
  /** Día del periodo en que se quedaría sin plata al ritmo actual (ISO) o null. */
  runOutDate: ISODate | null;
}

/**
 * Ritmo de gasto: compara la velocidad real de gasto libre contra el presupuesto
 * diario, y proyecta cuándo se acabaría el dinero.
 */
export function computePace(input: BudgetInput, budget: BudgetResult): PaceResult {
  const { period, expenses } = input;
  const ref = input.ref ?? hoy();
  const { elapsed } = periodProgress(period, ref);
  const diasTranscurridos = Math.max(1, elapsed + 1); // incluye hoy

  // Gasto "libre" = manual (no buses, no cuotas de deuda, no aportes)
  const libre = expenses
    .filter((e) => periodContains(period, e.date))
    .filter((e) => e.source === undefined || e.source === "manual")
    .reduce((s, e) => s + e.amount, 0);

  const dailyRate = Math.round(libre / diasTranscurridos);
  const dailyBudget = budget.perDaySafe;
  const overpacing = dailyRate > dailyBudget && dailyBudget >= 0;

  let runOutDate: ISODate | null = null;
  if (dailyRate > 0) {
    // Con "available" restante y gastando dailyRate/día, ¿cuántos días aguanta?
    const diasQueAguanta = Math.floor(budget.available / dailyRate);
    if (diasQueAguanta < budget.daysLeft) {
      const d = addDays(ref, Math.max(0, diasQueAguanta));
      if (ymd(d) <= ymd(period.end)) runOutDate = ymd(d);
    }
  }

  return { dailyRate, dailyBudget, overpacing, runOutDate };
}
