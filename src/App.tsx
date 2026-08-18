import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { TabBar, type TabId } from "./ui/TabBar";
import { AddExpenseSheet } from "./ui/AddExpenseSheet";
import { UpdateBanner } from "./ui/UpdateBanner";
import { useStore } from "./store/useStore";
import { loadBackup } from "./lib/idbBackup";
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
  const [checkedBackup, setCheckedBackup] = useState(false);

  // Aplica el tema al <html>: "auto" quita el atributo (sigue al sistema).
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);

  // Al cambiar de pestaña, vuelve arriba. Sin esto, si scrolleaste mucho en una
  // pestaña larga (ej. Ajustes) y cambias a una más corta, la nueva pestaña puede
  // quedar completamente fuera de vista — se ve como si la app se hubiera colgado.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  // Restauración automática: si al abrir la app se ve "vacía" (sin onboarding
  // completo ni datos) pero existe un respaldo en IndexedDB con datos reales,
  // lo recupera solo. Cubre el caso de que localStorage se haya borrado o el
  // esquema haya cambiado de versión.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = useStore.getState();
      const looksEmpty = !s.onboarded && s.expenses.length === 0 && Object.keys(s.salaries).length === 0;
      if (looksEmpty) {
        const backup = await loadBackup();
        if (backup && !cancelled) {
          try {
            const parsed = JSON.parse(backup.json) as { onboarded?: boolean; expenses?: unknown[] };
            if (parsed?.onboarded || (parsed?.expenses?.length ?? 0) > 0) {
              useStore.getState().importJSON(backup.json);
            }
          } catch {
            // respaldo corrupto: se ignora, sigue el onboarding normal
          }
        }
      }
      if (!cancelled) setCheckedBackup(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Botón de retroceso físico de Android: cierra el sheet de registro si está
  // abierto, si no vuelve a Inicio, y solo si ya estás en Inicio sale de la app.
  // Sin esto, el botón atrás cierra la app de un toque desde cualquier pestaña
  // (comportamiento por defecto del WebView, se siente roto en una app nativa).
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = CapApp.addListener("backButton", () => {
      if (addOpen) {
        setAddOpen(false);
      } else if (tab !== "inicio") {
        setTab("inicio");
      } else {
        CapApp.exitApp();
      }
    });
    return () => {
      sub.then((s) => s.remove());
    };
  }, [addOpen, tab]);

  if (!checkedBackup) return <div className="min-h-full bg-bg" />;
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
            {tab === "inicio" && <Home />}
            {tab === "gastos" && <Expenses />}
            {tab === "plan" && <Plan />}
            {tab === "ajustes" && <Settings />}
          </motion.main>
        </AnimatePresence>
      </div>

      <TabBar active={tab} onChange={setTab} onAdd={() => setAddOpen(true)} />
      <AddExpenseSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <UpdateBanner />
    </div>
  );
}
