import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sheet } from "./Sheet";
import { NumPad } from "./NumPad";
import { useStore } from "../store/useStore";
import { money } from "../lib/money";
import { hoy, ymd } from "../lib/dates";
import { Segmented } from "./primitives";
import { suggestCategory } from "../lib/categorize";
import { useDictation } from "./useDictation";
import type { CategoryId, Expense, PayMethod } from "../lib/types";

/**
 * Sheet para registrar o editar un gasto. Si recibe `expense`, entra en modo edición.
 * Incluye selector de fecha (para registrar pagos antiguos) y usa fecha LOCAL.
 */
export function AddExpenseSheet({
  open,
  onClose,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  expense?: Expense;
}) {
  const categories = useStore((s) => s.categories);
  const addExpense = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);
  const removeExpense = useStore((s) => s.removeExpense);
  const editing = !!expense;

  const firstCat = categories[0]?.id ?? "otros";
  const [amount, setAmount] = useState(0);
  const [cat, setCat] = useState<CategoryId>(firstCat);
  const [catTouched, setCatTouched] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(ymd(hoy()));
  const [method, setMethod] = useState<PayMethod>("digital");

  const dictation = useDictation((text) => {
    setNote((prev) => (prev ? `${prev} ${text}` : text));
  });

  // Al abrir, precarga desde el gasto a editar o resetea a valores nuevos.
  useEffect(() => {
    if (!open) return;
    if (expense) {
      setAmount(expense.amount);
      setCat(expense.category);
      setCatTouched(true); // ya tiene categoría real: no la pises con una sugerencia
      setNote(expense.note ?? "");
      setDate(expense.date);
      setMethod(expense.method ?? "digital");
    } else {
      setAmount(0);
      setCat(firstCat);
      setCatTouched(false);
      setNote("");
      setDate(ymd(hoy()));
      setMethod("digital");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense]);

  // Sugerencia de categoría según lo que se escribe/dicta en la nota.
  const suggestion = catTouched ? undefined : suggestCategory(note, categories);
  const showSuggestion = suggestion && suggestion.id !== cat;

  const save = () => {
    if (amount <= 0) return;
    if (editing && expense) {
      updateExpense(expense.id, { amount, category: cat, note: note.trim() || undefined, date, method });
    } else {
      addExpense({ date, amount, category: cat, note: note.trim() || undefined, method, source: "manual" });
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Editar gasto" : "Registrar gasto"}>
      {/* Fecha + método */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-[13px] text-ink3 font-medium ml-1">Fecha</span>
          <input
            type="date"
            value={date}
            max={ymd(hoy())}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-full mt-1 bg-card rounded-2xl px-3 py-3 text-[15px] outline-none tnum"
          />
        </label>
        <div>
          <span className="text-[13px] text-ink3 font-medium ml-1">Pagué con</span>
          <div className="mt-1">
            <Segmented<PayMethod>
              value={method}
              onChange={setMethod}
              options={[
                { value: "digital", label: "💳 Digital" },
                { value: "efectivo", label: "💵 Efectivo" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Selector de categoría */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCat(c.id); setCatTouched(true); }}
            className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border ${
              cat === c.id ? "border-accent bg-accent/10" : "border-transparent bg-card"
            }`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[11px] font-medium">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Nota + dictado de voz */}
      <div className="relative mt-3 mb-1">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional) — ej: almuerzo, uber, mercado…"
          className="w-full bg-card rounded-2xl pl-4 pr-12 py-3 text-[15px] outline-none placeholder:text-ink3"
        />
        {dictation.supported && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={dictation.toggle}
            aria-label="Dictar por voz"
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center ${
              dictation.listening ? "bg-danger text-white animate-pulse" : "bg-card2 text-ink3"
            }`}
          >
            {dictation.listening ? "●" : "🎤"}
          </motion.button>
        )}
      </div>

      {/* Sugerencia automática de categoría */}
      {showSuggestion && (
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => { setCat(suggestion.id); setCatTouched(true); }}
          className="w-full flex items-center gap-2 bg-accent/10 text-accent rounded-2xl px-4 py-2.5 mb-2 text-left"
        >
          <span className="text-lg">{suggestion.emoji}</span>
          <span className="text-[13px] flex-1">¿Es de <b>{suggestion.name}</b>?</span>
          <span className="text-[13px] font-semibold">Usar</span>
        </motion.button>
      )}

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
        {amount > 0 ? (editing ? `Guardar cambios · ${money(amount)}` : `Guardar ${money(amount)}`) : "Ingresa un monto"}
      </motion.button>

      {editing && expense && (
        <button
          onClick={() => {
            removeExpense(expense.id);
            onClose();
          }}
          className="w-full pb-3 text-danger text-[15px] font-medium"
        >
          Eliminar gasto
        </button>
      )}
    </Sheet>
  );
}
