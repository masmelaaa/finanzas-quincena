import { motion } from "framer-motion";

export type TabId = "inicio" | "gastos" | "plan" | "ajustes";

const TABS: { id: TabId; label: string; icon: JSX.Element }[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    id: "gastos",
    label: "Gastos",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 10h18" />
      </>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    icon: (
      <>
        <path d="M4 19V5m0 14h16M8 15v-4m4 4V8m4 7v-6" />
      </>
    ),
  },
  {
    id: "ajustes",
    label: "Ajustes",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2" />
      </>
    ),
  },
];

export function TabBar({
  active,
  onChange,
  onAdd,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto max-w-md bg-bg2/80 backdrop-blur-xl border-t hairline pb-safe">
        <div className="grid grid-cols-5 items-center px-2 pt-1.5">
          {TABS.slice(0, 2).map((t) => (
            <TabButton key={t.id} tab={t} active={active === t.id} onClick={() => onChange(t.id)} />
          ))}

          {/* Botón central + */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onAdd}
              className="w-14 h-14 -mt-6 rounded-full bg-accent shadow-lg flex items-center justify-center"
              aria-label="Registrar gasto"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" stroke="white" strokeWidth="2.6" strokeLinecap="round" fill="none">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </motion.button>
          </div>

          {TABS.slice(2).map((t) => (
            <TabButton key={t.id} tab={t} active={active === t.id} onClick={() => onChange(t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-1.5">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "rgb(var(--accent))" : "rgb(var(--ink3))"}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tab.icon}
      </svg>
      <span className={`text-[10px] font-medium ${active ? "text-accent" : "text-ink3"}`}>
        {tab.label}
      </span>
    </button>
  );
}
