import type { ReactNode } from "react";
import { grouped, parseMoney } from "../../lib/money";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="text-[13px] text-ink3 font-medium ml-1">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card rounded-2xl px-4 py-3 text-[16px] outline-none placeholder:text-ink3 border border-transparent focus:border-accent"
    />
  );
}

/** Input de dinero con formato en vivo (puntos de miles). */
export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center bg-card rounded-2xl px-4 border border-transparent focus-within:border-accent">
      <span className="text-ink3 text-[16px]">$</span>
      <input
        inputMode="numeric"
        value={value ? grouped(value) : ""}
        onChange={(e) => onChange(parseMoney(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-transparent px-2 py-3 text-[16px] outline-none tnum placeholder:text-ink3"
      />
    </div>
  );
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-11 h-11 rounded-2xl bg-card text-[22px] font-medium active:bg-card2"
      >
        −
      </button>
      <span className="flex-1 text-center text-[18px] font-semibold tnum">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-11 h-11 rounded-2xl bg-card text-[22px] font-medium active:bg-card2"
      >
        +
      </button>
    </div>
  );
}

const EMOJIS = ["🏍️", "🚗", "✈️", "🏠", "💻", "📱", "🎓", "🛟", "💍", "🎸", "🏦", "🤝", "💳", "🎁", "⚽", "🐕"];

export function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => onChange(e)}
          className={`shrink-0 w-11 h-11 rounded-2xl text-2xl flex items-center justify-center ${
            value === e ? "bg-accent/15 ring-2 ring-accent" : "bg-card"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export function SubmitBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full mt-2 mb-3 py-4 rounded-2xl font-semibold text-[17px] ${
        disabled ? "bg-card text-ink3" : "bg-accent text-white"
      }`}
    >
      {children}
    </button>
  );
}
