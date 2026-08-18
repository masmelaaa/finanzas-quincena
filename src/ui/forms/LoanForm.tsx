import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, EmojiPicker, SubmitBtn } from "./fields";
import { money } from "../../lib/money";
import { ymd, hoy } from "../../lib/dates";

export function LoanForm({ onDone }: { onDone: () => void }) {
  const addLoan = useStore((s) => s.addLoan);
  const [person, setPerson] = useState("");
  const [emoji, setEmoji] = useState("🤝");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!person.trim() || amount <= 0) return;
    addLoan({ person: person.trim(), emoji, amount, date: ymd(hoy()), note: note.trim() || undefined });
    onDone();
  };

  return (
    <div className="pb-2">
      <Field label="¿A quién le prestaste?">
        <TextInput value={person} onChange={setPerson} placeholder="Ej: Camilo, mi hermano…" />
      </Field>
      <Field label="Ícono">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>
      <Field label="Cuánto le prestaste">
        <MoneyInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="Nota (opcional)">
        <TextInput value={note} onChange={setNote} placeholder="Ej: para la moto, se lo dio en efectivo…" />
      </Field>

      {amount > 0 && (
        <div className="rounded-2xl bg-card px-4 py-3 mb-2 text-[14px] flex justify-between">
          <span className="text-ink3">Te deben</span>
          <span className="tnum font-semibold text-accent">{money(amount)}</span>
        </div>
      )}

      <SubmitBtn onClick={submit} disabled={!person.trim() || amount <= 0}>
        Guardar préstamo
      </SubmitBtn>
    </div>
  );
}
