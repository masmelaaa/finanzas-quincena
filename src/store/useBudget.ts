// Selector compuesto: del store crudo saca el presupuesto, ritmo y alertas del periodo actual.
import { useMemo } from "react";
import { hoy } from "../lib/dates";
import { periodNow } from "../lib/periods";
import { computeBudget, computePace } from "../lib/budget";
import { buildAlerts, categorySpends } from "../lib/alerts";
import { transportPlan } from "../lib/transport";
import { computeWallet } from "../lib/wallet";
import { useStore } from "./useStore";

export function useBudget() {
  const salaries = useStore((s) => s.salaries);
  const expenses = useStore((s) => s.expenses);
  const fixed = useStore((s) => s.fixed);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const transport = useStore((s) => s.transport);
  const transportOverrides = useStore((s) => s.transportOverrides);
  const categories = useStore((s) => s.categories);
  const salaryCash = useStore((s) => s.salaryCash);

  return useMemo(() => {
    const period = periodNow();
    const ref = hoy();
    const salary = salaries[period.id] ?? 0;
    const transportOverride = transportOverrides[period.id];

    const input = { period, salary, expenses, fixed, goals, debts, transport, transportOverride, ref };
    const budget = computeBudget(input);
    const pace = computePace(input, budget);

    const plan = transportPlan(period, transport);
    const wallet = computeWallet(period, salary, salaryCash[period.id] ?? 0, expenses);

    const catSpends = categorySpends(categories, expenses, period);
    const alerts = buildAlerts(budget, pace, catSpends);

    return { period, salary, budget, pace, plan, wallet, catSpends, alerts };
  }, [salaries, salaryCash, expenses, fixed, goals, debts, transport, transportOverrides, categories]);
}
