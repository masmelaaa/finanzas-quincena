// Utilidades de fecha SIN zona horaria: trabajamos con fechas "de calendario"
// (año/mes/día locales) para evitar corrimientos por UTC. La clave canónica de
// un día es su string ISO "YYYY-MM-DD".

export type ISODate = string; // "2026-08-09"

export function ymd(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Crea una fecha local a mediodía (evita saltos por DST/UTC). */
export function dateAt(y: number, m1: number, d: number): Date {
  return new Date(y, m1 - 1, d, 12, 0, 0, 0);
}

export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return dateAt(y, m, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Diferencia en días de calendario (b - a). */
export function daysBetween(a: Date, b: Date): number {
  const ms = dateAt(b.getFullYear(), b.getMonth() + 1, b.getDate()).getTime() -
    dateAt(a.getFullYear(), a.getMonth() + 1, a.getDate()).getTime();
  return Math.round(ms / 86_400_000);
}

export function isSameDay(a: Date, b: Date): boolean {
  return ymd(a) === ymd(b);
}

/** 0 = domingo ... 6 = sábado */
export function dow(d: Date): number {
  return d.getDay();
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_ABR = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const DIAS_ABR = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function mesNombre(m1: number): string {
  return MESES[m1 - 1];
}

/** "9 ago" */
export function fmtCorto(d: Date): string {
  return `${d.getDate()} ${MESES_ABR[d.getMonth()]}`;
}

/** "sáb 9 ago" */
export function fmtDiaCorto(d: Date): string {
  return `${DIAS_ABR[d.getDay()]} ${d.getDate()} ${MESES_ABR[d.getMonth()]}`;
}

/** "9 de agosto" */
export function fmtLargo(d: Date): string {
  return `${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function hoy(): Date {
  const n = new Date();
  return dateAt(n.getFullYear(), n.getMonth() + 1, n.getDate());
}
