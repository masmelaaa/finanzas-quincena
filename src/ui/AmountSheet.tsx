import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sheet } from "./Sheet";
import { NumPad } from "./NumPad";
import { money } from "../lib/money";

/** Sheet reutilizable para capturar un monto con el teclado numérico. */
export function AmountSheet({
  open,
  onClose,
  title,
  cta,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  cta: string;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    if (open) setAmount(0);
  }, [open]);

  const confirm = () => {
    if (amount <= 0) return;
    onConfirm(amount);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="mt-1">
        <NumPad value={amount} onChange={setAmount} />
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={confirm}
        disabled={amount <= 0}
        className={`w-full mt-4 mb-2 py-4 rounded-2xl font-semibold text-[17px] ${
          amount > 0 ? "bg-accent text-white" : "bg-card text-ink3"
        }`}
      >
        {amount > 0 ? `${cta} ${money(amount)}` : "Ingresa un monto"}
      </motion.button>
    </Sheet>
  );
}
