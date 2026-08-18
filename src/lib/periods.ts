// Periodos de pago configurables: quincenal (dos días del mes), semanal
// (un día de la semana, cada 1 o 2 semanas) o mensual (un día del mes).
// El caso por defecto (quincenal 5 y 20) preserva exactamente el comportamiento
// original: mismo formato de id, mismas quincenas.

import { addDays, dateAt, daysBetween, hoy, mesNombre, parseISO, type ISODate, ymd } from "./dates";
import type { PaySchedule } from "./types";

export const DEFAULT_SCHEDULE: PaySchedule = { kind: "quincenal", days: [5, 20] };

export interface Period {
  id: string;
  start: Date;
  end: Date; // inclusivo
  /** Slot de pago dentro del ciclo: 0 = único/primero, 1 = segundo (solo quincenal). */
  payIndex: 0 | 1;
  label: string; // "5 – 19 ago" o "20 ago – 4 sep"
}

const MESES_ABR = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sm = MESES_ABR[start.getMonth()];
  const em = MESES_ABR[end.getMonth()];
  if (sameMonth) return `${start.getDate()} – ${end.getDate()} ${sm}`;
  return `${start.getDate()} ${sm} – ${end.getDate()} ${em}`;
}

function daysInMonth(y: number, m1: number): number {
  return new Date(y, m1, 0).getDate();
}

function clampDay(y: number, m1: number, day: number): number {
  return Math.max(1, Math.min(day, daysInMonth(y, m1)));
}

/** Suma `delta` meses a (y, m1), devolviendo el (año, mes) resultante normalizado. */
function shiftMonth(y: number, m1: number, delta: number): { y: number; m1: number } {
  const total = y * 12 + (m1 - 1) + delta;
  return { y: Math.floor(total / 12), m1: ((total % 12) + 12) % 12 + 1 };
}

/** Ajusta `d` al primer día >= d cuyo día de semana sea `weekday`. */
function toWeekday(d: Date, weekday: number): Date {
  const delta = (weekday - d.getDay() + 7) % 7;
  return addDays(d, delta);
}

interface Candidate {
  date: Date;
  payIndex: 0 | 1;
}

/** Fechas de pago candidatas alrededor de `ref` (algunas antes, algunas después). */
function candidatePaydays(schedule: PaySchedule, ref: Date): Candidate[] {
  const y = ref.getFullYear();
  const m1 = ref.getMonth() + 1;
  const out: Candidate[] = [];

  if (schedule.kind === "quincenal") {
    const [d0, d1] = [...schedule.days].sort((a, b) => a - b);
    for (const delta of [-1, 0, 1]) {
      const { y: yy, m1: mm } = shiftMonth(y, m1, delta);
      out.push({ date: dateAt(yy, mm, clampDay(yy, mm, d0)), payIndex: 0 });
      if (d1 !== d0) out.push({ date: dateAt(yy, mm, clampDay(yy, mm, d1)), payIndex: 1 });
    }
  } else if (schedule.kind === "mensual") {
    for (const delta of [-1, 0, 1]) {
      const { y: yy, m1: mm } = shiftMonth(y, m1, delta);
      out.push({ date: dateAt(yy, mm, clampDay(yy, mm, schedule.day)), payIndex: 0 });
    }
  } else {
    // semanal
    if (schedule.everyWeeks === 2) {
      const anchor = toWeekday(schedule.anchor ? parseISO(schedule.anchor) : ref, schedule.weekday);
      const diff = daysBetween(anchor, ref);
      const k0 = Math.floor(diff / 14) - 1;
      for (let k = k0; k <= k0 + 3; k++) {
        out.push({ date: addDays(anchor, k * 14), payIndex: 0 });
      }
    } else {
      for (let off = -21; off <= 21; off++) {
        const d = addDays(ref, off);
        if (d.getDay() === schedule.weekday) out.push({ date: d, payIndex: 0 });
      }
    }
  }
  return out.sort((a, b) => (ymd(a.date) < ymd(b.date) ? -1 : ymd(a.date) > ymd(b.date) ? 1 : 0));
}

/** El periodo de pago que contiene la fecha d, según el schedule configurado. */
export function periodFor(d: Date, schedule: PaySchedule = DEFAULT_SCHEDULE): Period {
  const candidates = candidatePaydays(schedule, d);
  const dISO = ymd(d);

  let prevIdx = 0;
  for (let i = 0; i < candidates.length; i++) {
    if (ymd(candidates[i].date) <= dISO) prevIdx = i;
    else break;
  }

  const start = candidates[prevIdx].date;
  const payIndex = candidates[prevIdx].payIndex;
  const next = candidates[prevIdx + 1]?.date ?? addDays(start, 14);
  const end = addDays(next, -1);

  // Formato de id: para quincenal preserva el esquema original (AAAA-MM-A/B),
  // así los datos ya guardados (sueldos, transporte editado…) siguen coincidiendo
  // cuando el schedule por defecto no cambia.
  const id =
    schedule.kind === "quincenal"
      ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${payIndex === 0 ? "A" : "B"}`
      : `${schedule.kind}-${ymd(start)}`;

  return { id, start, end, payIndex, label: buildLabel(start, end) };
}

/** El periodo siguiente al dado. */
export function nextPeriod(p: Period, schedule: PaySchedule = DEFAULT_SCHEDULE): Period {
  return periodFor(addDays(p.end, 1), schedule);
}

/** El periodo anterior al dado. */
export function prevPeriod(p: Period, schedule: PaySchedule = DEFAULT_SCHEDULE): Period {
  return periodFor(addDays(p.start, -1), schedule);
}

export function periodNow(schedule: PaySchedule = DEFAULT_SCHEDULE): Period {
  return periodFor(hoy(), schedule);
}

/** Título humano del periodo, ej: "1ª quincena · agosto". */
export function periodTitle(p: Period, schedule: PaySchedule = DEFAULT_SCHEDULE): string {
  const mes = mesNombre(p.start.getMonth() + 1);
  if (schedule.kind === "quincenal") {
    return `${p.payIndex === 0 ? "1ª" : "2ª"} quincena · ${mes}`;
  }
  if (schedule.kind === "semanal") return `Semana de pago · ${mes}`;
  return `Pago mensual · ${mes}`;
}

/** Descripción corta del schedule, ej: "Pago el 5 y el 20" / "Pago los viernes". */
export function scheduleDescription(schedule: PaySchedule): string {
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  if (schedule.kind === "quincenal") {
    const [d0, d1] = [...schedule.days].sort((a, b) => a - b);
    return `Pago el ${d0} y el ${d1} de cada mes`;
  }
  if (schedule.kind === "mensual") return `Pago el día ${schedule.day} de cada mes`;
  const cada = schedule.everyWeeks === 2 ? "cada 2 semanas" : "cada semana";
  return `Pago los ${DIAS[schedule.weekday]}, ${cada}`;
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
