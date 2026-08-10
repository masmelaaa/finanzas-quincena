import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Field, TextInput, MoneyInput, SubmitBtn } from "./fields";
import type { Category } from "../../lib/types";

// Sugerencias rápidas; igual puedes escribir/pegar cualquier emoji.
const QUICK = ["🍔", "🚌", "🛒", "🎮", "💡", "💊", "🏦", "✨", "☕", "🍺", "👕", "⛽", "🎬", "📚", "🐶", "🏋️", "💇", "🎁"];

export function CategoryForm({
  category,
  onDone,
}: {
  category?: Category;
  onDone: () => void;
}) {
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const editing = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [emoji, setEmoji] = useState(category?.emoji ?? "🏷️");
  const [limit, setLimit] = useState(category?.limit ?? 0);

  // Toma solo el primer "carácter" visible (soporta emojis compuestos).
  const takeEmoji = (v: string) => {
    const chars = Array.from(v.trim());
    if (chars.length === 0) return;
    setEmoji(chars[chars.length - 1]);
  };

  const submit = () => {
    if (!name.trim()) return;
    if (editing && category) {
      updateCategory(category.id, { name: name.trim(), emoji, limit });
    } else {
      addCategory({ name: name.trim(), emoji, limit });
    }
    onDone();
  };

  return (
    <div className="pb-2">
      {/* Emoji grande + input libre */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-3xl bg-card flex items-center justify-center text-5xl mb-2">
          {emoji}
        </div>
        <input
          value={emoji}
          onChange={(e) => takeEmoji(e.target.value)}
          className="w-24 text-center bg-card rounded-xl px-2 py-2 text-2xl outline-none"
          aria-label="Emoji de la categoría"
        />
        <p className="text-[11px] text-ink3 mt-1">Toca y usa el teclado de emojis 😀</p>
      </div>

      {/* Sugerencias */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-1 px-1">
        {QUICK.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`shrink-0 w-11 h-11 rounded-2xl text-2xl flex items-center justify-center ${
              emoji === e ? "bg-accent/15 ring-2 ring-accent" : "bg-card"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <Field label="Nombre de la categoría">
        <TextInput value={name} onChange={setName} placeholder="Ej: Café, Gimnasio, Mascota…" />
      </Field>
      <Field label="Límite por quincena (opcional)">
        <MoneyInput value={limit} onChange={setLimit} placeholder="Sin límite" />
      </Field>

      <SubmitBtn onClick={submit} disabled={!name.trim()}>
        {editing ? "Guardar cambios" : "Crear categoría"}
      </SubmitBtn>
    </div>
  );
}
