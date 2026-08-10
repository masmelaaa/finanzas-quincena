import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { Card, ProgressBar, SectionTitle } from "../ui/primitives";
import { money, moneyShort } from "../lib/money";
import { goalPerPeriod } from "../lib/budget";
import { fmtCorto, parseISO } from "../lib/dates";
import { Sheet } from "../ui/Sheet";
import { GoalForm } from "../ui/forms/GoalForm";
import { DebtForm } from "../ui/forms/DebtForm";
import { ExtraForm } from "../ui/forms/ExtraForm";
import type { Goal } from "../lib/types";

export function Plan() {
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const [goalOpen, setGoalOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);

  return (
    <div>
      <header className="pt-2 pb-2">
        <h1 className="text-[28px] font-bold">Plan</h1>
        <p className="text-[14px] text-ink3">Ahorro, extras, metas y deudas</p>
      </header>

      {/* EXTRAS / DINERO ADICIONAL */}
      <SectionTitle action={<AddBtn onClick={() => setExtraOpen(true)} />}>Extras · dinero adicional</SectionTitle>
      <ExtrasCard />

      {/* METAS */}
      <SectionTitle action={<AddBtn onClick={() => setGoalOpen(true)} />}>Metas de ahorro</SectionTitle>
      {goals.length === 0 && <Empty text="Crea tu primera meta y la app calcula cuánto apartar cada quincena." />}
      <div className="space-y-3">
        {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
      </div>

      {/* RETO */}
      <SectionTitle>Reto escalonado</SectionTitle>
      <Challenge />

      {/* DEUDAS */}
      <SectionTitle action={<AddBtn onClick={() => setDebtOpen(true)} />}>Deudas</SectionTitle>
      {debts.length === 0 && <Empty text="Agrega una deuda y lleva el conteo de cuántas cuotas te faltan." />}
      <div className="space-y-3">
        {debts.map((d) => <DebtCard key={d.id} id={d.id} />)}
      </div>

      <Sheet open={goalOpen} onClose={() => setGoalOpen(false)} title="Nueva meta">
        <GoalForm onDone={() => setGoalOpen(false)} />
      </Sheet>
      <Sheet open={debtOpen} onClose={() => setDebtOpen(false)} title="Nueva deuda">
        <DebtForm onDone={() => setDebtOpen(false)} />
      </Sheet>
      <Sheet open={extraOpen} onClose={() => setExtraOpen(false)} title="Registrar un extra">
        <ExtraForm onDone={() => setExtraOpen(false)} />
      </Sheet>
    </div>
  );
}

/* ---------- Extras / dinero adicional ---------- */
function ExtrasCard() {
  const extras = useStore((s) => s.extras);
  const savingsPot = useStore((s) => s.savingsPot);
  const goals = useStore((s) => s.goals);
  const removeExtra = useStore((s) => s.removeExtra);

  // Ahorro total = bote general + lo ahorrado en todas las metas.
  const enMetas = goals.reduce((a, g) => a + g.saved, 0);
  const totalAhorro = savingsPot + enMetas;
  const totalExtras = extras.reduce((a, e) => a + e.amount, 0);
  const goalName = (id?: string) => (id ? goals.find((g) => g.id === id)?.name ?? "meta" : "Bote general");

  return (
    <>
      {/* Resumen de ahorro */}
      <Card className="p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wide text-ink3">Ahorro total</p>
            <p className="text-[26px] font-bold tnum text-accent leading-tight">{money(totalAhorro)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-ink3">🫙 Bote libre</p>
            <p className="text-[15px] font-semibold tnum">{money(savingsPot)}</p>
          </div>
        </div>
        {totalExtras > 0 && (
          <p className="text-[12px] text-ink3 mt-2">
            Llevas {money(totalExtras)} en extras fuera de nómina — todo fue al ahorro. 💪
          </p>
        )}
      </Card>

      {/* Lista de extras */}
      {extras.length > 0 && (
        <Card className="divide-y hairline mb-1">
          {extras.slice(0, 6).map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl">{e.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[14px] truncate">{e.concept}</p>
                <p className="text-[12px] text-ink3">→ {goalName(e.goalId)} · {fmtCorto(parseISO(e.date))}</p>
              </div>
              <span className="tnum font-semibold text-accent">+ {money(e.amount)}</span>
              <button onClick={() => removeExtra(e.id)} className="text-ink3 text-[12px] pl-1">✕</button>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-accent text-[15px] font-semibold normal-case tracking-normal">
      + Agregar
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="p-5 text-center">
      <p className="text-[13px] text-ink3">{text}</p>
    </Card>
  );
}

/* ---------- Meta ---------- */
function GoalCard({ goal }: { goal: Goal }) {
  const contribute = useStore((s) => s.contributeGoal);
  const removeGoal = useStore((s) => s.removeGoal);
  const ratio = goal.target > 0 ? goal.saved / goal.target : 0;
  const perPeriod = goalPerPeriod(goal);
  const restante = Math.max(0, goal.target - goal.saved);

  // ¿Va al día? Comparamos progreso esperado vs real por tiempo.
  const onTrack = goal.deadline ? estimateOnTrack(goal) : true;
  const complete = goal.saved >= goal.target;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{goal.emoji}</span>
          <div>
            <p className="font-semibold">{goal.name}</p>
            <p className="text-[12px] text-ink3 tnum">
              {money(goal.saved)} de {money(goal.target)}
            </p>
          </div>
        </div>
        <span className="text-[13px] font-semibold tnum text-accent">{Math.round(ratio * 100)}%</span>
      </div>

      <div className="mt-3">
        <ProgressBar ratio={ratio} level={complete ? "ok" : onTrack ? "ok" : "warn"} />
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        {complete ? (
          <span className="text-accent font-semibold">¡Meta cumplida! 🎉</span>
        ) : (
          <>
            <span className="text-ink3">
              {perPeriod > 0 ? <>Aporta <b className="text-ink">{money(perPeriod)}</b>/quincena</> : "Sin fecha objetivo"}
            </span>
            <span className={onTrack ? "text-accent" : "text-amber"}>
              {onTrack ? "● Vas al día" : "● Atrasado"}
            </span>
          </>
        )}
      </div>

      {!complete && (
        <div className="mt-3 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => contribute(goal.id, Math.min(restante, perPeriod || Math.round(goal.target * 0.1)))}
            className="flex-1 py-2.5 rounded-xl bg-accent/12 text-accent font-semibold text-[14px]"
          >
            Abonar {moneyShort(Math.min(restante, perPeriod || Math.round(goal.target * 0.1)))}
          </motion.button>
          <button
            onClick={() => removeGoal(goal.id)}
            className="px-3 rounded-xl text-ink3 text-[13px]"
          >
            Borrar
          </button>
        </div>
      )}
      {goal.deadline && (
        <p className="text-[11px] text-ink3 mt-2">Objetivo: {fmtCorto(parseISO(goal.deadline))}</p>
      )}
    </Card>
  );
}

/**
 * ¿La meta va al día? Compara el % ahorrado real con el % de tiempo transcurrido
 * desde el primer aporte (o hoy) hasta el deadline. Si ahorró al menos tanto como
 * tiempo pasó, va al día.
 */
function estimateOnTrack(goal: Goal): boolean {
  if (!goal.deadline) return true;
  const savedRatio = goal.target > 0 ? goal.saved / goal.target : 1;
  if (savedRatio >= 1) return true;

  const end = parseISO(goal.deadline).getTime();
  const firstContribution = goal.contributions.length
    ? parseISO(goal.contributions[goal.contributions.length - 1].date).getTime()
    : Date.now();
  const startWindow = Math.min(firstContribution, Date.now());
  const totalSpan = end - startWindow;
  if (totalSpan <= 0) return savedRatio >= 1;
  const timeRatio = Math.min(1, (Date.now() - startWindow) / totalSpan);
  // margen de 5% para no marcar atrasado por un pelo
  return savedRatio + 0.05 >= timeRatio;
}

/* ---------- Reto escalonado ---------- */
function Challenge() {
  const ch = useStore((s) => s.challenge);
  const toggle = useStore((s) => s.toggleChallengeStep);

  const steps = Array.from({ length: ch.totalSteps }, (_, i) => ({
    i,
    amount: ch.baseAmount + i * ch.stepAmount,
    done: ch.done.includes(i),
  }));
  const saved = steps.filter((s) => s.done).reduce((a, s) => a + s.amount, 0);
  const total = steps.reduce((a, s) => a + s.amount, 0);
  const streak = ch.done.length;

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-semibold">Reto de {ch.totalSteps} pasos</p>
        <p className="text-[13px] text-accent font-semibold tnum">{money(saved)} / {money(total)}</p>
      </div>
      <p className="text-[12px] text-ink3 mb-3">
        Cada paso ahorras un poco más. Llevas {streak} de {ch.totalSteps} · racha 🔥
      </p>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((s) => (
          <motion.button
            key={s.i}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(s.i)}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-semibold tnum ${
              s.done ? "bg-accent text-white" : "bg-card2 text-ink3"
            }`}
          >
            {s.done ? "✓" : moneyShort(s.amount).replace("$", "")}
          </motion.button>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Deuda: contador de cuotas ---------- */
function DebtCard({ id }: { id: string }) {
  const debt = useStore((s) => s.debts.find((d) => d.id === id))!;
  const pay = useStore((s) => s.payInstallment);
  const undo = useStore((s) => s.undoInstallment);
  const remove = useStore((s) => s.removeDebt);
  if (!debt) return null;

  const left = debt.totalInstallments - debt.paidInstallments;
  const saldo = left * debt.installmentValue;
  const done = left <= 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{debt.emoji}</span>
          <div>
            <p className="font-semibold">{debt.name}</p>
            <p className="text-[12px] text-ink3 tnum">
              Cuota {money(debt.installmentValue)} · quincena del {debt.payPeriod === "primera" ? 5 : 20}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-[26px] font-bold leading-none tnum ${done ? "text-accent" : "text-ink"}`}>
            {done ? "0" : left}
          </p>
          <p className="text-[10px] text-ink3 uppercase tracking-wide">
            {done ? "saldada" : left === 1 ? "cuota falta" : "cuotas faltan"}
          </p>
        </div>
      </div>

      {/* Puntos de cuotas */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {Array.from({ length: debt.totalInstallments }, (_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: i < debt.paidInstallments ? 1 : 0.85 }}
            className={`w-3.5 h-3.5 rounded-full ${
              i < debt.paidInstallments ? "bg-accent" : "bg-black/12 dark:bg-white/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="text-ink3">Saldo restante</span>
        <span className="tnum font-semibold">{money(saldo)}</span>
      </div>

      {done ? (
        <div className="mt-3 py-2.5 rounded-xl bg-accent/12 text-accent font-semibold text-center text-[14px]">
          Saldada 🎉
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => pay(debt.id)}
            className="flex-1 py-2.5 rounded-xl bg-accent text-white font-semibold text-[14px]"
          >
            Pagar cuota
          </motion.button>
          {debt.paidInstallments > 0 && (
            <button onClick={() => undo(debt.id)} className="px-3 rounded-xl text-ink3 text-[13px]">
              Deshacer
            </button>
          )}
          <button onClick={() => remove(debt.id)} className="px-3 rounded-xl text-ink3 text-[13px]">
            Borrar
          </button>
        </div>
      )}
    </Card>
  );
}
