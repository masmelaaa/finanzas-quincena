import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, EmojiPicker, SubmitBtn } from "./fields";
import { goalPerPeriod } from "../../lib/budget";
import { money } from "../../lib/money";
import { ymd, addDays, hoy, parseISO } from "../../lib/dates";

export function GoalForm({ onDone }: { onDone: () => void }) {
  const addGoal = useStore((s) => s.addGoal);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏍️");
  const [target, setTarget] = useState(0);
  const [saved, setSaved] = useState(0);
  const [deadline, setDeadline] = useState(ymd(addDays(hoy(), 180)));

  const preview =
    target > 0 && deadline
      ? goalPerPeriod(
          { id: "x", name, emoji, target, saved, deadline, contributions: [] },
          hoy(),
        )
      : 0;

  const submit = () => {
    if (!name.trim() || target <= 0) return;
    addGoal({ name: name.trim(), emoji, target, deadline, saved });
    onDone();
  };

  return (
    <div className="pb-2">
      <Field label="¿Para qué ahorras?">
        <TextInput value={name} onChange={setName} placeholder="Ej: Moto, viaje, PC…" />
      </Field>
      <Field label="Ícono">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>
      <Field label="Meta total">
        <MoneyInput value={target} onChange={setTarget} />
      </Field>
      <Field label="Ya tengo ahorrado (opcional)">
        <MoneyInput value={saved} onChange={setSaved} />
      </Field>
      <Field label="Fecha objetivo">
        <input
          type="date"
          value={deadline}
          min={ymd(hoy())}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full bg-card rounded-2xl px-4 py-3 text-[16px] outline-none tnum"
        />
      </Field>

      {preview > 0 && (
        <div className="rounded-2xl bg-accent/10 text-accent px-4 py-3 mb-2 text-[14px]">
          Debes apartar <b>{money(preview)}</b> cada quincena para llegar a la meta el{" "}
          {parseISO(deadline).getDate()}/{parseISO(deadline).getMonth() + 1}.
        </div>
      )}

      <SubmitBtn onClick={submit} disabled={!name.trim() || target <= 0}>
        Crear meta
      </SubmitBtn>
    </div>
  );
}
