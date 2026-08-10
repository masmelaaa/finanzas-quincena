import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TabBar, type TabId } from "./ui/TabBar";
import { AddExpenseSheet } from "./ui/AddExpenseSheet";
import { useStore } from "./store/useStore";
import { Home } from "./screens/Home";
import { Expenses } from "./screens/Expenses";
import { Plan } from "./screens/Plan";
import { Settings } from "./screens/Settings";
import { Onboarding } from "./screens/Onboarding";

export default function App() {
  const theme = useStore((s) => s.theme);
  const onboarded = useStore((s) => s.onboarded);
  const [tab, setTab] = useState<TabId>("inicio");
  const [addOpen, setAddOpen] = useState(false);

  // Aplica el tema al <html>: "auto" quita el atributo (sigue al sistema).
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  if (!onboarded) return <Onboarding />;

  return (
    <div className="min-h-full bg-bg text-ink">
      <div className="mx-auto max-w-md min-h-full relative">
        <AnimatePresence mode="wait">
          <motion.main
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-4 pt-safe pb-32"
          >
            {tab === "inicio" && <Home onAdd={() => setAddOpen(true)} />}
            {tab === "gastos" && <Expenses />}
            {tab === "plan" && <Plan />}
            {tab === "ajustes" && <Settings />}
          </motion.main>
        </AnimatePresence>
      </div>

      <TabBar active={tab} onChange={setTab} onAdd={() => setAddOpen(true)} />
      <AddExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
