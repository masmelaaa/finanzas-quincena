import { useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useStore } from "../store/useStore";
import { periodNow, nextPeriod, prevPeriod } from "../lib/periods";
import { Card, SectionTitle, Segmented, Toggle } from "../ui/primitives";
import { MoneyInput } from "../ui/forms/fields";
import { Sheet } from "../ui/Sheet";
import { FixedForm } from "../ui/forms/FixedForm";
import { CategoryForm } from "../ui/forms/CategoryForm";
import { money } from "../lib/money";
import type { Category, ThemeMode } from "../lib/types";

export function Settings() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const salaries = useStore((s) => s.salaries);
  const setSalary = useStore((s) => s.setSalary);
  const salaryCash = useStore((s) => s.salaryCash);
  const setSalaryCash = useStore((s) => s.setSalaryCash);
  const categories = useStore((s) => s.categories);
  const setCategories = useStore((s) => s.setCategories);
  const removeCategory = useStore((s) => s.removeCategory);
  const fixed = useStore((s) => s.fixed);
  const removeFixed = useStore((s) => s.removeFixed);
  const exportJSON = useStore((s) => s.exportJSON);
  const importJSON = useStore((s) => s.importJSON);
  const resetAll = useStore((s) => s.resetAll);
  const [fixedOpen, setFixedOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const cur = periodNow();
  const [periodId, setPeriodId] = useState(cur.id);
  const period =
    periodId === cur.id
      ? cur
      : periodId === nextPeriod(cur).id
        ? nextPeriod(cur)
        : prevPeriod(cur);

  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis-finanzas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJSON(String(reader.result));
      alert(ok ? "Datos importados ✓" : "No se pudo leer el archivo");
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <header className="pt-2 pb-2">
        <h1 className="text-[28px] font-bold">Ajustes</h1>
      </header>

      {/* Sueldo */}
      <SectionTitle>Sueldo por quincena</SectionTitle>
      <Card className="p-4">
        <Segmented
          value={periodId}
          onChange={setPeriodId}
          options={[
            { value: prevPeriod(cur).id, label: "Anterior" },
            { value: cur.id, label: "Actual" },
            { value: nextPeriod(cur).id, label: "Siguiente" },
          ]}
        />
        <p className="text-[13px] text-ink3 mt-3 mb-1 ml-1">{period.label}</p>
        <MoneyInput
          value={salaries[period.id] ?? 0}
          onChange={(v) => setSalary(period.id, v)}
        />
        <p className="text-[13px] text-ink3 mt-3 mb-1 ml-1">¿Cuánto del sueldo es en efectivo?</p>
        <MoneyInput
          value={salaryCash[period.id] ?? 0}
          onChange={(v) => setSalaryCash(period.id, v)}
          placeholder="0 (todo digital)"
        />
        <p className="text-[11px] text-ink3 mt-2 ml-1">El resto se cuenta como digital (banco/tarjeta).</p>
      </Card>

      {/* Transporte */}
      <SectionTitle>Transporte</SectionTitle>
      <Card className="p-4 space-y-4">
        <Row label="Valor del pasaje">
          <div className="w-36">
            <MoneyInput value={transport.fare} onChange={(v) => setTransport({ fare: v })} />
          </div>
        </Row>
        <Stepper
          label="Pasajes entre semana"
          value={transport.ridesPerDay}
          onChange={(v) => setTransport({ ridesPerDay: v })}
        />
        <Stepper
          label="Pasajes los sábados"
          value={transport.ridesPerSaturday}
          onChange={(v) => setTransport({ ridesPerSaturday: v })}
        />
        <Row label="Trabajo domingos impares">
          <Toggle on={transport.includeSundays} onChange={(v) => setTransport({ includeSundays: v })} />
        </Row>
        <p className="text-[12px] text-ink3">
          Regla: salgo los días impares + sábados, menos festivos. La app calcula el
          presupuesto de buses de cada quincena y lo descuenta completo.
        </p>
      </Card>

      {/* Gastos fijos */}
      <SectionTitle
        action={
          <button onClick={() => setFixedOpen(true)} className="text-accent text-[15px] font-semibold normal-case tracking-normal">
            + Agregar
          </button>
        }
      >
        Gastos fijos
      </SectionTitle>
      {fixed.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-[13px] text-ink3">
            No tienes gastos fijos. Agrega arriendo, servicios, suscripciones… y se descuentan
            solos cada quincena.
          </p>
        </Card>
      ) : (
        <Card className="divide-y hairline">
          {fixed.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-[15px]">{f.name}</p>
                <p className="text-[12px] text-ink3">
                  {f.when === "ambas" ? "Cada quincena" : f.when === "primera" ? "Quincena del 5" : "Quincena del 20"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="tnum font-semibold">{money(f.amount)}</span>
                <button onClick={() => removeFixed(f.id)} className="text-ink3 text-[13px]">✕</button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Categorías */}
      <SectionTitle
        action={
          <button
            onClick={() => { setEditCat(null); setCatOpen(true); }}
            className="text-accent text-[15px] font-semibold normal-case tracking-normal"
          >
            + Agregar
          </button>
        }
      >
        Categorías
      </SectionTitle>
      <Reorder.Group
        axis="y"
        values={categories}
        onReorder={setCategories}
        className="bg-card rounded-ios overflow-hidden shadow-card"
      >
        {categories.map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            canDelete={categories.length > 1}
            onEdit={() => { setEditCat(c); setCatOpen(true); }}
            onDelete={() => {
              if (confirm(`¿Borrar la categoría "${c.name}"? Sus gastos pasarán a otra categoría.`)) removeCategory(c.id);
            }}
          />
        ))}
      </Reorder.Group>
      <p className="text-center text-[12px] text-ink3 mt-2 px-4">
        Arrastra ⠿ para reordenar · toca para editar emoji, nombre o límite.
      </p>

      {/* Apariencia */}
      <SectionTitle>Apariencia</SectionTitle>
      <Card className="p-4">
        <Segmented<ThemeMode>
          value={theme}
          onChange={setTheme}
          options={[
            { value: "auto", label: "Automático" },
            { value: "light", label: "Claro" },
            { value: "dark", label: "Oscuro" },
          ]}
        />
      </Card>

      {/* Datos */}
      <SectionTitle>Datos</SectionTitle>
      <Card className="divide-y hairline">
        <button onClick={doExport} className="w-full px-4 py-3.5 text-left flex justify-between">
          <span>Exportar respaldo (JSON)</span>
          <span className="text-ink3">↓</span>
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full px-4 py-3.5 text-left flex justify-between">
          <span>Importar respaldo</span>
          <span className="text-ink3">↑</span>
        </button>
        <button
          onClick={() => {
            if (confirm("¿Borrar todos los datos y empezar desde cero?")) resetAll();
          }}
          className="w-full px-4 py-3.5 text-left text-danger"
        >
          Borrar todos los datos
        </button>
      </Card>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
      />

      <p className="text-center text-[12px] text-ink3 mt-8 mb-4">
        Todos tus datos viven solo en este dispositivo. Nada se sube a internet.
      </p>

      <Sheet open={fixedOpen} onClose={() => setFixedOpen(false)} title="Nuevo gasto fijo">
        <FixedForm onDone={() => setFixedOpen(false)} />
      </Sheet>
      <Sheet
        open={catOpen}
        onClose={() => setCatOpen(false)}
        title={editCat ? "Editar categoría" : "Nueva categoría"}
      >
        <CategoryForm category={editCat ?? undefined} onDone={() => setCatOpen(false)} />
      </Sheet>
    </div>
  );
}

function CategoryRow({
  category,
  canDelete,
  onEdit,
  onDelete,
}: {
  category: Category;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={category}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 px-3 py-3 bg-card border-b hairline last:border-b-0"
    >
      {/* asa de arrastre */}
      <span
        onPointerDown={(e) => controls.start(e)}
        className="text-ink3 text-[20px] px-1 cursor-grab touch-none select-none"
        style={{ touchAction: "none" }}
        aria-label="Arrastrar para reordenar"
      >
        ⠿
      </span>
      <button onClick={onEdit} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <span className="text-2xl">{category.emoji}</span>
        <div className="min-w-0">
          <p className="font-medium text-[15px] truncate">{category.name}</p>
          <p className="text-[12px] text-ink3 tnum">
            {category.limit > 0 ? `Límite ${money(category.limit)}/quincena` : "Sin límite"}
          </p>
        </div>
      </button>
      <button onClick={onEdit} className="text-accent text-[13px] font-medium px-1">
        Editar
      </button>
      {canDelete && (
        <button onClick={onDelete} className="text-ink3 text-[13px] px-1">
          ✕
        </button>
      )}
    </Reorder.Item>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[15px]">{label}</span>
      {children}
    </div>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-9 h-9 rounded-xl bg-card2 text-[20px]">−</button>
        <span className="w-6 text-center font-semibold tnum">{value}</span>
        <button onClick={() => onChange(Math.min(10, value + 1))} className="w-9 h-9 rounded-xl bg-card2 text-[20px]">+</button>
      </div>
    </Row>
  );
}
