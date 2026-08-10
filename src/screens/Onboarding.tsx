import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { periodNow } from "../lib/periods";
import { MoneyInput } from "../ui/forms/fields";
import { transportPlan } from "../lib/transport";
import { money } from "../lib/money";

export function Onboarding() {
  const setSalary = useStore((s) => s.setSalary);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const finish = useStore((s) => s.finishOnboarding);
  const salaries = useStore((s) => s.salaries);

  const period = periodNow();
  const [salary, setLocalSalary] = useState(salaries[period.id] ?? 0);
  const [fare, setFare] = useState(transport.fare);
  const [step, setStep] = useState(0);

  const plan = transportPlan(period, { ...transport, fare });

  const next = () => {
    if (step === 0) {
      setSalary(period.id, salary);
      setStep(1);
    } else {
      setTransport({ fare });
      finish();
    }
  };

  return (
    <div className="min-h-full bg-bg text-ink flex flex-col">
      <div className="mx-auto max-w-md w-full flex-1 flex flex-col px-6 pt-safe pb-safe">
        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {step === 0 ? (
              <>
                <p className="text-5xl mb-4">👋</p>
                <h1 className="text-[30px] font-bold leading-tight mb-2">
                  Controla tu plata quincena a quincena
                </h1>
                <p className="text-ink3 text-[15px] mb-8">
                  Te pagan el 5 y el 20. Empecemos con tu sueldo de la quincena actual
                  ({period.label}). Puedes cambiarlo cuando quieras.
                </p>
                <p className="text-[13px] text-ink3 font-medium ml-1 mb-1">Sueldo de esta quincena</p>
                <MoneyInput value={salary} onChange={setLocalSalary} placeholder="1.850.000" />
              </>
            ) : (
              <>
                <p className="text-5xl mb-4">🚌</p>
                <h1 className="text-[30px] font-bold leading-tight mb-2">
                  Tu presupuesto de buses
                </h1>
                <p className="text-ink3 text-[15px] mb-6">
                  Sales los días impares + sábados, menos festivos, 2 pasajes por día.
                  Solo confirma cuánto vale tu pasaje y yo hago las cuentas.
                </p>
                <p className="text-[13px] text-ink3 font-medium ml-1 mb-1">Valor del pasaje</p>
                <MoneyInput value={fare} onChange={setFare} placeholder="3.550" />

                <div className="mt-6 rounded-ios bg-card p-4">
                  <p className="text-[13px] text-ink3">Esta quincena ({period.label})</p>
                  <p className="text-[15px] mt-1">
                    <b className="tnum">{plan.totalDays}</b> salidas ·{" "}
                    <b className="tnum">{plan.totalRides}</b> pasajes
                  </p>
                  <p className="text-[28px] font-bold tnum text-accent mt-1">
                    {money(plan.totalCost)}
                  </p>
                  {plan.skippedHolidays.length > 0 && (
                    <p className="text-[12px] text-ink3 mt-2">
                      Descontados por festivo: {plan.skippedHolidays.map((h) => h.name).join(", ")}
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>

        <div className="pb-6">
          <div className="flex justify-center gap-1.5 mb-4">
            {[0, 1].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-accent" : "w-1.5 bg-ink3/40"
                }`}
              />
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={next}
            className="w-full py-4 rounded-2xl bg-accent text-white font-semibold text-[17px]"
          >
            {step === 0 ? "Continuar" : "Empezar"}
          </motion.button>
          {step === 0 && (
            <button onClick={finish} className="w-full py-3 text-ink3 text-[14px]">
              Omitir por ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
