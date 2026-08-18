import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { registerSW } from "virtual:pwa-register";

/**
 * Banner de actualización: el service worker NUNCA recarga la app solo.
 * Cuando hay versión nueva, avisa y el usuario decide cuándo actualizar.
 * (Antes usábamos "autoUpdate", que recargaba a mitad de una acción y
 * se sentía como que la app "se congelaba".)
 */
export function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onRegisteredSW(_url, reg) {
        // revisa si hay una versión nueva cada vez que el usuario vuelve a la app
        if (!reg) return;
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") reg.update().catch(() => {});
        });
      },
    });
    setUpdateFn(() => update);
  }, []);

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="fixed top-0 inset-x-0 z-[60] pt-safe"
        >
          <div className="mx-auto max-w-md m-3 rounded-2xl bg-ink text-bg px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="text-xl">🔄</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px]">Hay una versión nueva</p>
              <p className="text-[12px] opacity-70">Tus datos no se pierden al actualizar.</p>
            </div>
            <button
              onClick={() => updateFn?.()}
              className="bg-accent text-white text-[13px] font-semibold px-3 py-2 rounded-xl shrink-0"
            >
              Actualizar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
