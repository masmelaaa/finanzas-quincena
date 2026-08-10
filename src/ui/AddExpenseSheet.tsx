import { useState } from "react";
import { motion } from "framer-motion";
import { Sheet } from "./Sheet";
import { NumPad } from "./NumPad";
import { useStore } from "../store/useStore";
import { money } from "../lib/money";
import type { CategoryId } from "../lib/types";

export function AddExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useStore((s) => s.categories);
  const transport = useStore((s) => s.transport);
  const addExpense = useStore((s) => s.addExpense);
  const addBusRide = useStore((s) => s.addBusRide);

  const [amount, setAmount] = useState(0);
  const [cat, setCat] = useState<CategoryId>("comida");
  const [note, setNote] = useState("");

  const reset = () => {
    setAmount(0);
    setNote("");
    setCat("comida");
  };

  const save = () => {
    if (amount <= 0) return;
    addExpense({
      date: new Date().toISOString().slice(0, 10),
      amount,
      category: cat,
      note: note.trim() || undefined,
      source: "manual",
    });
    reset();
    onClose();
  };

  const quickBus = () => {
    addBusRide();
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title="Registrar gasto">
      {/* Atajo pasaje */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={quickBus}
        className="w-full mb-4 flex items-center gap-3 bg-accent/12 text-accent rounded-2xl px-4 py-3"
      >
        <span className="text-2xl">🚌</span>
        <div className="text-left">
          <div className="font-semibold text-ink">Pasaje del bus</div>
          <div className="text-[13px] text-ink3">
            {transport.ridesPerDay} pasajes · {money(transport.fare * transport.ridesPerDay)}
          </div>
        </div>
        <span className="ml-auto text-[13px] font-semibold">Agregar →</span>
      </motion.button>

      {/* Selector de categoría */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border ${
              cat === c.id
                ? "border-accent bg-accent/10"
                : "border-transparent bg-card"
            }`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[11px] font-medium">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Nota */}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota (opcional)"
        className="w-full mt-3 mb-1 bg-card rounded-2xl px-4 py-3 text-[15px] outline-none placeholder:text-ink3"
      />

      {/* Teclado */}
      <div className="mt-2">
        <NumPad value={amount} onChange={setAmount} />
      </div>

      {/* Guardar */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={save}
        disabled={amount <= 0}
        className={`w-full mt-4 mb-2 py-4 rounded-2xl font-semibold text-[17px] ${
          amount > 0 ? "bg-accent text-white" : "bg-card text-ink3"
        }`}
      >
        {amount > 0 ? `Guardar ${money(amount)}` : "Ingresa un monto"}
      </motion.button>
    </Sheet>
  );
}
