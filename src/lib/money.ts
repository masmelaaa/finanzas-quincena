// Formato de moneda colombiana (COP): sin decimales, puntos de miles.
// Ej: 1850000 -> "$ 1.850.000"

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** "$ 1.850.000". Redondea a peso. */
export function money(n: number): string {
  const v = Math.round(n || 0);
  // Intl pone "$1.850.000"; le damos un espacio tras el símbolo (estilo iOS/limpio).
  return COP.format(v).replace(/^(\D+)/, "$1 ").replace(/\s+/, " ");
}

/** Solo el número con puntos de miles, sin símbolo. Ej: "1.850.000" */
export function grouped(n: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );
}

/** Parsea "1.850.000" o "1850000" o "$ 1.850.000" -> 1850000 */
export function parseMoney(s: string): number {
  const digits = (s || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Abreviatura compacta para espacios chicos: 1850000 -> "$1,85M" */
export function moneyShort(n: number): string {
  const v = Math.round(n || 0);
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1000)}k`;
  return `$${v}`;
}
