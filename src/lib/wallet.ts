// Composición de la plata por ubicación: efectivo vs digital.
// Es un tracker de "dónde está tu plata" del periodo, separado del Disponible.

import type { Period } from "./periods";
import { periodContains } from "./periods";
import type { Expense, PayMethod } from "./types";

export interface WalletSplit {
  cash: number; // efectivo
  digital: number;
  total: number;
}

function methodOf(m?: PayMethod): PayMethod {
  return m === "efectivo" ? "efectivo" : "digital";
}

/**
 * Calcula cuánta plata del periodo está en efectivo y cuánta digital.
 *   efectivo = sueldoEfectivo + extras/ingresos efectivo − gastos efectivo
 *   digital  = (sueldo − sueldoEfectivo) − gastos digital
 * (Los extras al sueldo ya vienen sumados dentro de `salary`/`salaryCash`.)
 */
export function computeWallet(
  period: Period,
  salary: number,
  salaryCash: number,
  expenses: Expense[],
): WalletSplit {
  const cashStart = Math.min(salaryCash, salary);
  const digitalStart = salary - cashStart;

  let cashSpent = 0;
  let digitalSpent = 0;
  for (const e of expenses) {
    if (!periodContains(period, e.date)) continue;
    if (methodOf(e.method) === "efectivo") cashSpent += e.amount;
    else digitalSpent += e.amount;
  }

  const cash = cashStart - cashSpent;
  const digital = digitalStart - digitalSpent;
  return { cash, digital, total: cash + digital };
}
