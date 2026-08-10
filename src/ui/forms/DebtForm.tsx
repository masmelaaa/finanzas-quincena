import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, NumberInput, EmojiPicker, SubmitBtn } from "./fields";
import { Segmented } from "../primitives";
import { money } from "../../lib/money";

export function DebtForm({ onDone }: { onDone: () => void }) {
  const addDebt = useStore((s) => s.addDebt);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏦");
  const [installmentValue, setValue] = useState(0);
  const [totalInstallments, setTotal] = useState(12);
  const [paidInstallments, setPaid] = useState(0);
  const [payPeriod, setPayPeriod] = useState<"primera" | "segunda">("primera");

  const saldo = Math.max(0, (totalInstallments - paidInstallments) * installmentValue);

  const submit = () => {
    if (!name.trim() || installmentValue <= 0 || totalInstallments <= 0) return;
    addDebt({
      name: name.trim(),
      emoji,
      installmentValue,
      totalInstallments,
      paidInstallments: Math.min(paidInstallments, totalInstallments),
      payPeriod,
    });
    onDone();
  };

  return (
    <div className="pb-2">
      <Field label="Nombre de la deuda">
        <TextInput value={name} onChange={setName} placeholder="Ej: Celular, préstamo…" />
      </Field>
      <Field label="Ícono">
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </Field>
      <Field label="Valor de cada cuota">
        <MoneyInput value={installmentValue} onChange={setValue} />
      </Field>
      <Field label="¿En qué quincena la pagas?">
        <Segmented
          value={payPeriod}
          onChange={setPayPeriod}
          options={[
            { value: "primera", label: "Pago del 5" },
            { value: "segunda", label: "Pago del 20" },
          ]}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cuotas totales">
          <NumberInput value={totalInstallments} onChange={setTotal} min={1} max={120} />
        </Field>
        <Field label="Ya pagadas">
          <NumberInput value={paidInstallments} onChange={setPaid} min={0} max={totalInstallments} />
        </Field>
      </div>

      {saldo > 0 && (
        <div className="rounded-2xl bg-card px-4 py-3 mb-2 text-[14px] flex justify-between">
          <span className="text-ink3">Te faltan {totalInstallments - paidInstallments} cuotas</span>
          <span className="tnum font-semibold">{money(saldo)}</span>
        </div>
      )}

      <SubmitBtn onClick={submit} disabled={!name.trim() || installmentValue <= 0}>
        Guardar deuda
      </SubmitBtn>
    </div>
  );
}
