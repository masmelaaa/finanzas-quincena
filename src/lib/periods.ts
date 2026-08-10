// Periodos de quincena. Al usuario le pagan el 5 y el 20.
// Periodo A: del 5 al 19.
// Periodo B: del 20 al 4 del mes siguiente (cruza mes; en diciembre cruza año).

import { addDays, dateAt, daysBetween, hoy, mesNombre, type ISODate, ymd } from "./dates";

export interface Period {
  id: string; // "2026-08-A" | "2026-08-B"  (mes/año del día de inicio)
  start: Date;
  end: Date; // inclusivo
  payday: 5 | 20;
  label: string; // "5 – 19 ago" o "20 ago – 4 sep"
}

const MESES_ABR = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function buildLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sm = MESES_ABR[start.getMonth()];
  const em = MESES_ABR[end.getMonth()];
  if (sameMonth) return `${start.getDate()} – ${end.getDate()} ${sm}`;
  return `${start.getDate()} ${sm} – ${end.getDate()} ${em}`;
}

/** El periodo que contiene la fecha d. */
export function periodFor(d: Date): Period {
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  if (day >= 20) {
    // 20 de este mes -> 4 del mes siguiente
    const start = dateAt(y, m, 20);
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    const end = dateAt(ny, nm, 4);
    return { id: `${y}-${pad(m)}-B`, start, end, payday: 20, label: buildLabel(start, end) };
  }
  if (day >= 5) {
    // 5 -> 19 de este mes
    const start = dateAt(y, m, 5);
    const end = dateAt(y, m, 19);
    return { id: `${y}-${pad(m)}-A`, start, end, payday: 5, label: buildLabel(start, end) };
  }
  // day 1..4 -> pertenece al periodo B del mes anterior (20 mes anterior -> 4 este mes)
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  const start = dateAt(py, pm, 20);
  const end = dateAt(y, m, 4);
  return { id: `${py}-${pad(pm)}-B`, start, end, payday: 20, label: buildLabel(start, end) };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** El periodo siguiente al dado. */
export function nextPeriod(p: Period): Period {
  return periodFor(addDays(p.end, 1));
}

/** El periodo anterior al dado. */
export function prevPeriod(p: Period): Period {
  return periodFor(addDays(p.start, -1));
}

export function periodNow(): Period {
  return periodFor(hoy());
}

/** Título humano del periodo, ej: "Quincena · agosto (5–19)". */
export function periodTitle(p: Period): string {
  const half = p.payday === 5 ? "1ª" : "2ª";
  return `${half} quincena · ${mesNombre(p.start.getMonth() + 1)}`;
}

/** Total de días del periodo (inclusivo). */
export function periodLength(p: Period): number {
  return daysBetween(p.start, p.end) + 1;
}

/**
 * Progreso del periodo relativo a "ref" (por defecto hoy):
 * - elapsed: días transcurridos (0..len)
 * - remaining: días que faltan (incluye hoy)
 * - fraction: 0..1
 */
export function periodProgress(p: Period, ref: Date = hoy()) {
  const len = periodLength(p);
  let elapsed = daysBetween(p.start, ref); // días completos antes de ref
  if (elapsed < 0) elapsed = 0;
  if (elapsed > len) elapsed = len;
  const remaining = Math.max(0, len - elapsed);
  return { len, elapsed, remaining, fraction: len ? elapsed / len : 0 };
}

/** ¿La fecha ISO cae dentro del periodo? */
export function periodContains(p: Period, iso: ISODate): boolean {
  return iso >= ymd(p.start) && iso <= ymd(p.end);
}
