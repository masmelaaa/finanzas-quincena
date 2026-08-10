import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, EmojiPicker, SubmitBtn } from "./fields";
import { money } from "../../lib/money";

export function CreditForm({ onDone }: { onDone: () => void }) {
  const addCard = useStore((s) => s.addCard);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💳");
  const [limit, setLimit] = useState(0);
  const [used, setUsed] = useState(0);

  const disponible = Math.max(0, limit - used);

  const submit = () => {
    if (!name.trim() || limit <= 0) return;
    addCard({ name: name.trim(), emoji, limit, used });
    onDone();
  };

  return (
    <div className="pb-2">
      <Field label="Nombre de la tarjeta">
        <TextInput value={name} onChange={setName} placeholder="Ej: Visa, Nu, Falabella…" />
      </Field>
      <Field label="Ícono">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>
      <Field label="Cupo total">
        <MoneyInput value={limit} onChange={setLimit} />
      </Field>
      <Field label="Cuánto llevas gastado">
        <MoneyInput value={used} onChange={setUsed} />
      </Field>

      {limit > 0 && (
        <div className="rounded-2xl bg-card px-4 py-3 mb-2 text-[14px] flex justify-between">
          <span className="text-ink3">Cupo disponible</span>
          <span className="tnum font-semibold text-accent">{money(disponible)}</span>
        </div>
      )}

      <SubmitBtn onClick={submit} disabled={!name.trim() || limit <= 0}>
        Guardar tarjeta
      </SubmitBtn>
    </div>
  );
}
