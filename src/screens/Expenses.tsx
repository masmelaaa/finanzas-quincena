import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { periodNow } from "../lib/periods";
import { fmtDiaCorto, parseISO, hoy, ymd } from "../lib/dates";
import { money } from "../lib/money";
import { Card, SectionTitle, Segmented } from "../ui/primitives";
import type { CategoryId, Expense } from "../lib/types";

export function Expenses() {
  const expenses = useStore((s) => s.expenses);
  const categories = useStore((s) => s.categories);
  const removeExpense = useStore((s) => s.removeExpense);
  const [scope, setScope] = useState<"quincena" | "todo">("quincena");

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])) as Record<CategoryId, (typeof categories)[number]>,
    [categories],
  );

  const period = periodNow();
  const filtered = useMemo(() => {
    const list = scope === "quincena"
      ? expenses.filter((e) => e.date >= ymd(period.start) && e.date <= ymd(period.end))
      : expenses;
    return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [expenses, scope, period.start, period.end]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Agrupa por día
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div>
      <header className="pt-2 pb-4">
        <h1 className="text-[28px] font-bold">Gastos</h1>
        <p className="text-[14px] text-ink3">
          {filtered.length} movimientos · {money(total)}
        </p>
      </header>

      <Segmented
        value={scope}
        onChange={setScope}
        options={[
          { value: "quincena", label: "Esta quincena" },
          { value: "todo", label: "Todo" },
        ]}
      />

      {groups.length === 0 && (
        <Card className="p-8 mt-6 text-center">
          <p className="text-4xl mb-2">🧾</p>
          <p className="font-semibold">Sin movimientos aún</p>
          <p className="text-[13px] text-ink3 mt-1">
            Toca el botón + para registrar tu primer gasto.
          </p>
        </Card>
      )}

      {groups.map(([date, items]) => {
        const dayTotal = items.reduce((s, e) => s + e.amount, 0);
        const isToday = date === ymd(hoy());
        return (
          <div key={date}>
            <SectionTitle
              action={<span className="text-[13px] text-ink3 tnum normal-case tracking-normal font-medium">{money(dayTotal)}</span>}
            >
              {isToday ? "Hoy" : fmtDiaCorto(parseISO(date))}
            </SectionTitle>
            <Card className="divide-y hairline overflow-hidden">
              {items.map((e) => (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  cat={catMap[e.category]}
                  onDelete={() => removeExpense(e.id)}
                />
              ))}
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function ExpenseRow({
  expense,
  cat,
  onDelete,
}: {
  expense: Expense;
  cat: { emoji: string; name: string };
  onDelete: () => void;
}) {
  return (
    <div className="relative overflow-hidden">
      {/* fondo de eliminar */}
      <div className="absolute inset-y-0 right-0 w-24 bg-danger flex items-center justify-center">
        <span className="text-white font-semibold text-[14px]">Eliminar</span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -96, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) onDelete();
        }}
        className="relative bg-card flex items-center gap-3 px-4 py-3"
      >
        <span className="text-2xl">{cat?.emoji ?? "✨"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[15px] truncate">
            {expense.note || cat?.name || "Gasto"}
          </p>
          <p className="text-[12px] text-ink3">
            {cat?.name}
            {expense.source === "bus" && " · 🚌 bus"}
            {expense.source === "cuota" && " · cuota"}
            {expense.source === "aporte" && " · ahorro"}
          </p>
        </div>
        <span className="tnum font-semibold text-[15px]">− {money(expense.amount)}</span>
      </motion.div>
    </div>
  );
}
