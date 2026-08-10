import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, SubmitBtn } from "./fields";
import { money } from "../../lib/money";
import { ymd, hoy } from "../../lib/dates";

const CONCEPTS = [
  { emoji: "💵", label: "Efectivo" },
  { emoji: "🎁", label: "Regalo" },
  { emoji: "🛍️", label: "Venta" },
  { emoji: "⏰", label: "Hora extra" },
  { emoji: "💸", label: "Propina" },
  { emoji: "📈", label: "Comisión" },
];

export function ExtraForm({ onDone }: { onDone: () => void }) {
  const goals = useStore((s) => s.goals);
  const addExtra = useStore((s) => s.addExtra);

  const [amount, setAmount] = useState(0);
  const [concept, setConcept] = useState("Efectivo");
  const [emoji, setEmoji] = useState("💵");
  const [goalId, setGoalId] = useState<string | undefined>(undefined); // bote general por defecto

  const submit = () => {
    if (amount <= 0) return;
    addExtra({ date: ymd(hoy()), amount, concept: concept.trim() || "Extra", emoji, goalId });
    onDone();
  };

  const destino = goalId ? goals.find((g) => g.id === goalId)?.name : "Bote general de ahorro";

  return (
    <div className="pb-2">
      <div className="rounded-2xl bg-accent/10 text-accent px-4 py-3 mb-4 text-[13px]">
        💡 Todo lo que entra por fuera de tu nómina va <b>100% al ahorro</b>. Elige a dónde.
      </div>

      <Field label="¿De qué es el extra?">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {CONCEPTS.map((c) => (
            <button
              key={c.label}
              onClick={() => { setConcept(c.label); setEmoji(c.emoji); }}
              className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border ${
                concept === c.label ? "border-accent bg-accent/10" : "border-transparent bg-card"
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[11px] font-medium whitespace-nowrap">{c.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Concepto (opcional)">
        <TextInput value={concept} onChange={setConcept} placeholder="Ej: Venta de la bici" />
      </Field>

      <Field label="Monto recibido">
        <MoneyInput value={amount} onChange={setAmount} />
      </Field>

      <Field label="Mandar al ahorro de…">
        <div className="space-y-2">
          <DestinoBtn
            active={goalId === undefined}
            emoji="🫙"
            title="Bote general de ahorro"
            subtitle="Ahorro libre, sin meta puntual"
            onClick={() => setGoalId(undefined)}
          />
          {goals.map((g) => (
            <DestinoBtn
              key={g.id}
              active={goalId === g.id}
              emoji={g.emoji}
              title={g.name}
              subtitle={`Vas en ${money(g.saved)} de ${money(g.target)}`}
              onClick={() => setGoalId(g.id)}
            />
          ))}
        </div>
      </Field>

      {amount > 0 && (
        <div className="rounded-2xl bg-card px-4 py-3 mb-2 text-[14px] flex justify-between">
          <span className="text-ink3">Se ahorrará en {destino}</span>
          <span className="tnum font-semibold text-accent">+ {money(amount)}</span>
        </div>
      )}

      <SubmitBtn onClick={submit} disabled={amount <= 0}>
        {amount > 0 ? `Ahorrar ${money(amount)}` : "Ingresa el monto"}
      </SubmitBtn>
    </div>
  );
}

function DestinoBtn({
  active,
  emoji,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  emoji: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left ${
        active ? "border-accent bg-accent/10" : "border-transparent bg-card"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[14px] truncate">{title}</p>
        <p className="text-[12px] text-ink3 truncate">{subtitle}</p>
      </div>
      <span className={`w-5 h-5 rounded-full border-2 ${active ? "border-accent bg-accent" : "border-ink3"}`}>
        {active && <span className="block text-white text-[12px] leading-5 text-center">✓</span>}
      </span>
    </button>
  );
}
