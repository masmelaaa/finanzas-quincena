import { motion } from "framer-motion";
import { useState } from "react";
import { useBudget } from "../store/useBudget";
import { useStore } from "../store/useStore";
import { Card, CountUp, ProgressBar, QuincenaRing, SectionTitle } from "../ui/primitives";
import { money, moneyShort } from "../lib/money";
import { fmtCorto, hoy, parseISO } from "../lib/dates";
import { periodProgress, periodTitle } from "../lib/periods";
import { debtBelongsToPeriod, debtDueInPeriod } from "../lib/budget";
import { TransportEditSheet } from "../ui/TransportEditSheet";

export function Home() {
  const { period, salary, budget, catSpends, alerts } = useBudget();
  const debts = useStore((s) => s.debts);
  const transport = useStore((s) => s.transport);
  const payInstallment = useStore((s) => s.payInstallment);
  const [editTransport, setEditTransport] = useState(false);

  const prog = periodProgress(period, hoy());
  const timeFraction = prog.fraction;
  const moneyFraction = salary > 0 ? Math.max(0, budget.available) / salary : 0;
  const danger = budget.available < 0;

  const topAlert = alerts[0];
  const alertColor =
    topAlert.level === "danger"
      ? "bg-danger/12 text-danger"
      : topAlert.level === "warn"
        ? "bg-amber/12 text-amber"
        : "bg-accent/12 text-accent";

  const withLimit = catSpends.filter((c) => c.limit > 0);
  // Solo las deudas que se pagan en ESTA quincena y aún tienen cuotas pendientes.
  const dueDebts = debts
    .filter((d) => debtBelongsToPeriod(d, period) && d.totalInstallments - d.paidInstallments > 0)
    .map((d) => ({ debt: d, due: debtDueInPeriod(d, period) }));

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="text-[22px] font-bold leading-tight">{periodTitle(period)}</h1>
          <p className="text-[13px] text-ink3">{period.label} · {prog.remaining} días restantes</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink3 uppercase tracking-wide">Sueldo</p>
          <p className="text-[15px] font-semibold tnum">{moneyShort(salary)}</p>
        </div>
      </header>

      {/* Anillo héroe */}
      <Card className="p-6 pb-7">
        <QuincenaRing timeFraction={timeFraction} moneyFraction={moneyFraction} danger={danger}>
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink3">
            Disponible
          </span>
          <CountUp
            value={budget.available}
            className={`text-[34px] font-bold leading-tight ${danger ? "text-danger" : "text-ink"}`}
          />
          <span className="text-[12px] text-ink3 mt-0.5">
            {danger ? "Te pasaste" : `${money(budget.perDaySafe)}/día`}
          </span>
        </QuincenaRing>

        {/* Desglose */}
        <div className="mt-5 space-y-1.5 text-[14px]">
          <Row label="Sueldo" value={money(salary)} />
          <Row label="Gastado" value={`− ${money(budget.spent)}`} muted />
          <Row label={`Transporte (${budget.transportRides} pasajes${budget.transportEdited ? " · editado" : ""})`} value={`− ${money(budget.transportTotal)}`} muted />
          {budget.fixedTotal > 0 && <Row label="Gastos fijos" value={`− ${money(budget.fixedTotal)}`} muted />}
          {budget.savingsCommitted > 0 && <Row label="Ahorro comprometido" value={`− ${money(budget.savingsCommitted)}`} muted />}
          {budget.debtDue > 0 && <Row label="Cuotas de deuda" value={`− ${money(budget.debtDue)}`} muted />}
        </div>
      </Card>

      {/* Alerta principal */}
      <motion.div
        key={topAlert.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-3 rounded-ios px-4 py-3 ${alertColor}`}
      >
        <p className="font-semibold text-[15px]">{topAlert.title}</p>
        {topAlert.detail && <p className="text-[13px] opacity-90 mt-0.5">{topAlert.detail}</p>}
      </motion.div>

      {/* Transporte — total fijo de la quincena (editable) */}
      <SectionTitle
        action={
          <button
            onClick={() => setEditTransport(true)}
            className="text-accent text-[15px] font-semibold normal-case tracking-normal"
          >
            Editar
          </button>
        }
      >
        Transporte de la quincena
      </SectionTitle>
      <Card className="p-4" onClick={() => setEditTransport(true)}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚌</span>
          <div className="flex-1">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">
                Total a pagar
                {budget.transportEdited && (
                  <span className="ml-2 text-[11px] font-medium text-amber align-middle">editado</span>
                )}
              </span>
              <span className="tnum font-bold text-[18px] text-accent">{money(budget.transportTotal)}</span>
            </div>
            <p className="text-[13px] text-ink3">
              {budget.transportRides} pasajes · pasaje {money(transport.fare)}
              {budget.transportEdited && ` · auto: ${budget.transportAutoRides}`}
            </p>
          </div>
          <span className="text-ink3 text-[20px]">›</span>
        </div>
      </Card>

      {/* Límites por categoría */}
      {withLimit.length > 0 && (
        <>
          <SectionTitle>Límites por categoría</SectionTitle>
          <Card className="p-4 space-y-3.5">
            {withLimit.map((cs) => (
              <div key={cs.category.id}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[14px] font-medium">
                    {cs.category.emoji} {cs.category.name}
                  </span>
                  <span className={`text-[13px] tnum ${cs.level === "danger" ? "text-danger" : cs.level === "warn" ? "text-amber" : "text-ink3"}`}>
                    {money(cs.spent)} / {money(cs.limit)}
                  </span>
                </div>
                <ProgressBar ratio={cs.ratio} level={cs.level} />
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Deudas a pagar ESTA quincena */}
      {dueDebts.length > 0 && (
        <>
          <SectionTitle>Deudas de esta quincena</SectionTitle>
          <div className="space-y-3">
            {dueDebts.map(({ debt, due }) => {
              const left = debt.totalInstallments - debt.paidInstallments;
              const pagada = due === 0; // ya se pagó dentro del periodo
              return (
                <Card key={debt.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{debt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{debt.name}</p>
                      <p className="text-[12px] text-ink3">
                        Cuota {money(debt.installmentValue)} · quincena del {debt.payPeriod === "primera" ? 5 : 20}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[26px] font-bold leading-none tnum">{left}</p>
                      <p className="text-[10px] text-ink3 uppercase tracking-wide">
                        {left === 1 ? "cuota falta" : "cuotas faltan"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {pagada ? (
                      <span className="text-[13px] text-accent font-semibold">✓ Pagada esta quincena</span>
                    ) : (
                      <span className="text-[13px] text-amber font-semibold">● Pendiente · {money(due)}</span>
                    )}
                    {!pagada && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => payInstallment(debt.id)}
                        className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-[13px]"
                      >
                        Pagar cuota
                      </motion.button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Otras alertas */}
      {alerts.length > 1 && (
        <>
          <SectionTitle>Avisos</SectionTitle>
          <Card className="divide-y hairline">
            {alerts.slice(1).map((a) => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-[14px] font-medium">{a.title}</p>
                {a.detail && <p className="text-[12px] text-ink3 mt-0.5">{a.detail}</p>}
              </div>
            ))}
          </Card>
        </>
      )}

      <p className="text-center text-[12px] text-ink3 mt-8 mb-2">
        Próximo pago: {fmtCorto(nextPayday())} · quincena {period.label}
      </p>

      <TransportEditSheet open={editTransport} onClose={() => setEditTransport(false)} />
    </div>
  );
}

/** El siguiente día de pago (5 o 20) a partir de hoy. */
function nextPayday(): Date {
  const t = hoy();
  const y = t.getFullYear();
  const m = t.getMonth() + 1;
  const d = t.getDate();
  if (d < 5) return parseISO(`${y}-${String(m).padStart(2, "0")}-05`);
  if (d < 20) return parseISO(`${y}-${String(m).padStart(2, "0")}-20`);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return parseISO(`${ny}-${String(nm).padStart(2, "0")}-05`);
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? "text-ink3" : "text-ink2"}>{label}</span>
      <span className={`tnum ${muted ? "text-ink3" : "font-semibold"}`}>{value}</span>
    </div>
  );
}
