import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { periodNow, scheduleDescription } from "../lib/periods";
import { MoneyInput } from "../ui/forms/fields";
import { transportTotalForPeriod, TRANSPORT_MODES } from "../lib/transport";
import { money } from "../lib/money";

export function Onboarding() {
  const setSalary = useStore((s) => s.setSalary);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const finish = useStore((s) => s.finishOnboarding);
  const salaries = useStore((s) => s.salaries);
  const paySchedule = useStore((s) => s.paySchedule);

  const period = periodNow(paySchedule);
  const [salary, setLocalSalary] = useState(salaries[period.id] ?? 0);
  const [fare, setFare] = useState(transport.fare);
  const [gasolina, setGasolina] = useState(transport.gasolina);
  const [parqueadero, setParqueadero] = useState(transport.parqueadero);
  const [step, setStep] = useState(0);

  const isPropio = transport.mode === "propio";
  const modeInfo = TRANSPORT_MODES[transport.mode];
  const preview = transportTotalForPeriod(period, { ...transport, fare, gasolina, parqueadero });

  const next = () => {
    if (step === 0) {
      setSalary(period.id, salary);
      setStep(1);
    } else {
      setTransport({ fare, gasolina, parqueadero });
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
                  {scheduleDescription(paySchedule)}. Empecemos con tu sueldo de este periodo
                  ({period.label}). Puedes cambiar todo esto en Ajustes cuando quieras.
                </p>
                <p className="text-[13px] text-ink3 font-medium ml-1 mb-1">Sueldo de este periodo</p>
                <MoneyInput value={salary} onChange={setLocalSalary} placeholder="1.850.000" />
              </>
            ) : (
              <>
                <p className="text-5xl mb-4">{modeInfo.emoji}</p>
                <h1 className="text-[30px] font-bold leading-tight mb-2">
                  Tu presupuesto de transporte
                </h1>
                {isPropio ? (
                  <>
                    <p className="text-ink3 text-[15px] mb-6">
                      Vehículo propio: cuéntame cuánto gastas en gasolina y parqueaderos por
                      periodo. (Puedes cambiar el modo de transporte en Ajustes.)
                    </p>
                    <p className="text-[13px] text-ink3 font-medium ml-1 mb-1">Gasolina</p>
                    <MoneyInput value={gasolina} onChange={setGasolina} placeholder="0" />
                    <p className="text-[13px] text-ink3 font-medium ml-1 mb-1 mt-3">Parqueaderos</p>
                    <MoneyInput value={parqueadero} onChange={setParqueadero} placeholder="0" />
                  </>
                ) : (
                  <>
                    <p className="text-ink3 text-[15px] mb-6">
                      Sales los días impares + sábados, menos festivos, {transport.ridesPerDay} {modeInfo.unit}s por día.
                      Solo confirma cuánto vale cada {modeInfo.unit} y yo hago las cuentas.
                      (Puedes cambiar el modo de transporte en Ajustes.)
                    </p>
                    <p className="text-[13px] text-ink3 font-medium ml-1 mb-1">Valor del {modeInfo.unit}</p>
                    <MoneyInput value={fare} onChange={setFare} placeholder="3.550" />
                  </>
                )}

                <div className="mt-6 rounded-ios bg-card p-4">
                  <p className="text-[13px] text-ink3">Este periodo ({period.label})</p>
                  {!isPropio && preview.plan && (
                    <p className="text-[15px] mt-1">
                      <b className="tnum">{preview.plan.totalDays}</b> salidas ·{" "}
                      <b className="tnum">{preview.rides}</b> {modeInfo.unit}s
                    </p>
                  )}
                  <p className="text-[28px] font-bold tnum text-accent mt-1">
                    {money(preview.total)}
                  </p>
                  {!isPropio && preview.plan && preview.plan.skippedHolidays.length > 0 && (
                    <p className="text-[12px] text-ink3 mt-2">
                      Descontados por festivo: {preview.plan.skippedHolidays.map((h) => h.name).join(", ")}
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
