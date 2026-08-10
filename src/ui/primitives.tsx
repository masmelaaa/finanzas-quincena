import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/* ---------- Card ---------- */
export function Card({
  children,
  className = "",
  onClick,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "div" | "button";
}) {
  const Comp: any = onClick ? "button" : as;
  return (
    <Comp
      onClick={onClick}
      className={`bg-card rounded-ios shadow-card w-full text-left ${
        onClick ? "active:scale-[0.985] transition-transform" : ""
      } ${className}`}
    >
      {children}
    </Comp>
  );
}

/* ---------- Section header ---------- */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-1.5 mb-2 mt-6">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink3">
        {children}
      </h2>
      {action}
    </div>
  );
}

/* ---------- Progress bar (límites) ---------- */
export function ProgressBar({
  ratio,
  level,
}: {
  ratio: number;
  level: "ok" | "warn" | "danger" | "info";
}) {
  const color =
    level === "danger" ? "bg-danger" : level === "warn" ? "bg-amber" : "bg-accent";
  const pct = Math.min(100, Math.max(0, ratio * 100));
  return (
    <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

/* ---------- Anillo de quincena (signature) ----------
   Anillo doble: pista = progreso de tiempo (días), relleno = fracción de dinero
   disponible. El número héroe vive en el centro. */
export function QuincenaRing({
  timeFraction,
  moneyFraction,
  size = 232,
  stroke = 16,
  children,
  danger = false,
}: {
  timeFraction: number; // 0..1 tiempo transcurrido
  moneyFraction: number; // 0..1 dinero disponible / sueldo
  size?: number;
  stroke?: number;
  children: ReactNode;
  danger?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const money = Math.min(1, Math.max(0, moneyFraction));
  const timeMarker = Math.min(1, Math.max(0, timeFraction));
  const ringColor = danger ? "rgb(var(--danger))" : "rgb(var(--accent))";

  // Posición del marcador de "tiempo transcurrido" sobre el anillo.
  const angle = timeMarker * 2 * Math.PI - Math.PI / 2;
  const mx = size / 2 + r * Math.cos(angle);
  const my = size / 2 + r * Math.sin(angle);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* pista */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth={stroke}
          opacity={0.5}
        />
        {/* dinero disponible */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - money) }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      {/* marcador de tiempo */}
      <div
        className="absolute w-3 h-3 rounded-full bg-ink shadow ring-2 ring-card"
        style={{ left: mx - 6, top: my - 6 }}
        title="Tiempo transcurrido de la quincena"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ---------- Toggle iOS ---------- */
export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors ${
        on ? "bg-accent" : "bg-black/15 dark:bg-white/20"
      }`}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className="block w-[27px] h-[27px] bg-white rounded-full shadow"
        style={{ marginLeft: on ? 20 : 0 }}
      />
    </button>
  );
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative flex bg-black/[0.06] dark:bg-white/[0.08] rounded-[10px] p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex-1 py-1.5 text-[13px] font-medium z-10"
          >
            {active && (
              <motion.span
                layoutId="seg"
                className="absolute inset-0 bg-card rounded-[8px] shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <span className={`relative ${active ? "text-ink" : "text-ink3"}`}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Count-up de dinero ---------- */
export function CountUp({
  value,
  className = "",
  prefix = "$ ",
}: {
  value: number;
  className?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const formatted = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
    display,
  );
  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {formatted}
    </span>
  );
}
