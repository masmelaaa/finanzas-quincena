import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sheet } from "./Sheet";
import { useStore } from "../store/useStore";
import { periodNow } from "../lib/periods";
import { effectiveTransport } from "../lib/transport";
import { money } from "../lib/money";

/** Editar la cantidad de pasajes de la quincena actual (por si sobran buses). */
export function TransportEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const transport = useStore((s) => s.transport);
  const overrides = useStore((s) => s.transportOverrides);
  const setOverride = useStore((s) => s.setTransportOverride);
  const clearOverride = useStore((s) => s.clearTransportOverride);

  const period = periodNow();
  const et = effectiveTransport(period, transport, overrides[period.id]);
  const [rides, setRides] = useState(et.rides);

  // Al abrir, arranca en el valor actual.
  useEffect(() => {
    if (open) setRides(et.rides);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    setOverride(period.id, rides);
    onClose();
  };
  const reset = () => {
    clearOverride(period.id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajustar pasajes de la quincena">
      <p className="text-[14px] text-ink3 mb-4">
        Si te sobraron buses, caminaste o tomaste otro transporte, baja la cantidad de
        pasajes de esta quincena ({period.label}).
      </p>

      {/* Contador grande */}
      <div className="bg-card rounded-2xl p-5 mb-3">
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRides((r) => Math.max(0, r - 1))}
            className="w-14 h-14 rounded-full bg-card2 text-[28px] font-medium flex items-center justify-center"
          >
            −
          </motion.button>
          <div className="text-center min-w-[110px]">
            <p className="text-[44px] font-bold tnum leading-none">{rides}</p>
            <p className="text-[12px] text-ink3 uppercase tracking-wide mt-1">pasajes</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRides((r) => Math.min(60, r + 1))}
            className="w-14 h-14 rounded-full bg-accent text-white text-[28px] font-medium flex items-center justify-center"
          >
            +
          </motion.button>
        </div>

        <div className="mt-4 flex justify-between items-baseline">
          <span className="text-[13px] text-ink3">Total de transporte</span>
          <span className="tnum font-bold text-[18px] text-accent">
            {money(rides * transport.fare)}
          </span>
        </div>
      </div>

      {/* Referencia automática */}
      <div className="flex items-center justify-between px-1 mb-4 text-[13px]">
        <span className="text-ink3">
          Cálculo automático: {et.autoRides} pasajes ({money(et.autoRides * transport.fare)})
        </span>
        {rides !== et.autoRides && (
          <button onClick={() => setRides(et.autoRides)} className="text-accent font-semibold">
            Usar
          </button>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={save}
        className="w-full py-4 rounded-2xl bg-accent text-white font-semibold text-[17px]"
      >
        Guardar {rides} pasajes
      </motion.button>
      {overrides[period.id] != null && (
        <button onClick={reset} className="w-full py-3 text-ink3 text-[14px]">
          Volver al cálculo automático
        </button>
      )}
    </Sheet>
  );
}
