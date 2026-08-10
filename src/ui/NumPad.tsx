import { motion } from "framer-motion";
import { grouped } from "../lib/money";

/** Teclado numérico grande estilo iOS. Trabaja con el monto en pesos enteros. */
export function NumPad({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const press = (digit: string) => {
    if (digit === "⌫") {
      onChange(Math.floor(value / 10));
      return;
    }
    if (digit === "000") {
      const next = value * 1000;
      onChange(next > 999_999_999 ? value : next);
      return;
    }
    const next = value * 10 + parseInt(digit, 10);
    if (next > 999_999_999) return;
    onChange(next);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "⌫"];

  return (
    <div>
      <div className="text-center py-3">
        <span className="tnum text-[44px] font-bold leading-none">
          <span className="text-ink3">$</span> {grouped(value)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.94 }}
            onClick={() => press(k)}
            className={`h-14 rounded-2xl text-[22px] font-medium tnum ${
              k === "⌫"
                ? "text-ink2 bg-transparent"
                : "bg-card active:bg-card2 shadow-sm"
            }`}
          >
            {k}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
