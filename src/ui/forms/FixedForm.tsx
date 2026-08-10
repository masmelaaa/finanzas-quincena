import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, SubmitBtn } from "./fields";
import { Segmented } from "../primitives";
import type { CategoryId, FixedExpense } from "../../lib/types";

export function FixedForm({ onDone }: { onDone: () => void }) {
  const categories = useStore((s) => s.categories);
  const addFixed = useStore((s) => s.addFixed);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<CategoryId>("servicios");
  const [when, setWhen] = useState<FixedExpense["when"]>("ambas");

  const submit = () => {
    if (!name.trim() || amount <= 0) return;
    addFixed({ name: name.trim(), amount, category, when });
    onDone();
  };

  return (
    <div className="pb-2">
      <Field label="Nombre del gasto fijo">
        <TextInput value={name} onChange={setName} placeholder="Ej: Arriendo, plan celular…" />
      </Field>
      <Field label="Monto">
        <MoneyInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="¿En qué quincena se descuenta?">
        <Segmented
          value={when}
          onChange={setWhen}
          options={[
            { value: "ambas", label: "Ambas" },
            { value: "primera", label: "Pago 5" },
            { value: "segunda", label: "Pago 20" },
          ]}
        />
      </Field>
      <Field label="Categoría">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border ${
                category === c.id ? "border-accent bg-accent/10" : "border-transparent bg-card"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[11px] font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </Field>

      <SubmitBtn onClick={submit} disabled={!name.trim() || amount <= 0}>
        Guardar gasto fijo
      </SubmitBtn>
    </div>
  );
}
