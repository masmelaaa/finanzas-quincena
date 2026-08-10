import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-bg2 rounded-t-[28px] shadow-sheet max-h-[92vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
          >
            <div className="pt-2 pb-1 flex justify-center shrink-0">
              <div className="w-9 h-1.5 rounded-full bg-ink3/40" />
            </div>
            {title && (
              <div className="px-5 pb-2 shrink-0">
                <h2 className="text-[20px] font-bold">{title}</h2>
              </div>
            )}
            <div className="overflow-y-auto no-scrollbar px-5 pb-safe">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
