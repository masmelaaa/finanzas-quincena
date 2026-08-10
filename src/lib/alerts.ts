// Selectores de alertas: convierten el estado en banners visibles.

import { fmtCorto, parseISO } from "./dates";
import { money } from "./money";
import type { BudgetResult, PaceResult } from "./budget";
import type { Category, Expense } from "./types";
import type { Period } from "./periods";
import { periodContains } from "./periods";

export type AlertLevel = "info" | "warn" | "danger" | "ok";

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  detail?: string;
}

export interface CategorySpend {
  category: Category;
  spent: number;
  limit: number;
  ratio: number; // spent/limit (0 si no hay límite)
  level: AlertLevel; // ok < 0.8, warn < 1, danger >= 1
}

/** Gasto por categoría en el periodo, con nivel según el límite. */
export function categorySpends(
  categories: Category[],
  expenses: Expense[],
  period: Period,
): CategorySpend[] {
  const inP = expenses.filter((e) => periodContains(period, e.date));
  return categories.map((c) => {
    const spent = inP
      .filter((e) => e.category === c.id)
      .reduce((s, e) => s + e.amount, 0);
    const limit = c.limit || 0;
    const ratio = limit > 0 ? spent / limit : 0;
    let level: AlertLevel = "ok";
    if (limit > 0) {
      if (ratio >= 1) level = "danger";
      else if (ratio >= 0.8) level = "warn";
    }
    return { category: c, spent, limit, ratio, level };
  });
}

/** Construye la lista de alertas priorizada (peligro primero). */
export function buildAlerts(
  budget: BudgetResult,
  pace: PaceResult,
  catSpends: CategorySpend[],
): Alert[] {
  const out: Alert[] = [];

  // 1) Saldo negativo: lo más grave.
  if (budget.available < 0) {
    out.push({
      id: "over-budget",
      level: "danger",
      title: "Te pasaste del presupuesto",
      detail: `Vas ${money(Math.abs(budget.available))} por encima de lo que tienes esta quincena.`,
    });
  }

  // 2) Ritmo diario.
  if (budget.available >= 0 && pace.overpacing && pace.dailyRate > 0) {
    const base = `Gastas ${money(pace.dailyRate)}/día y te alcanza para ${money(
      pace.dailyBudget,
    )}/día.`;
    if (pace.runOutDate) {
      out.push({
        id: "pace",
        level: "warn",
        title: `A este ritmo te quedas sin plata el ${fmtCorto(parseISO(pace.runOutDate))}`,
        detail: base,
      });
    } else {
      out.push({ id: "pace", level: "warn", title: "Vas gastando rápido", detail: base });
    }
  }

  // 3) Categorías sobre el límite.
  for (const cs of catSpends) {
    if (cs.level === "danger") {
      out.push({
        id: `cat-${cs.category.id}`,
        level: "danger",
        title: `${cs.category.emoji} ${cs.category.name}: pasaste el límite`,
        detail: `${money(cs.spent)} de ${money(cs.limit)} (${Math.round(cs.ratio * 100)}%).`,
      });
    } else if (cs.level === "warn") {
      out.push({
        id: `cat-${cs.category.id}`,
        level: "warn",
        title: `${cs.category.emoji} ${cs.category.name} al ${Math.round(cs.ratio * 100)}%`,
        detail: `${money(cs.spent)} de ${money(cs.limit)}.`,
      });
    }
  }

  // 4) Todo en orden.
  if (out.length === 0) {
    out.push({
      id: "ok",
      level: "ok",
      title: "Vas bien 👌",
      detail: `Puedes gastar hasta ${money(budget.perDaySafe)}/día lo que queda de quincena.`,
    });
  }

  return out;
}
