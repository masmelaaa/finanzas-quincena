// Festivos de Colombia — CALCULADOS, no listados a mano.
// 6 fijos + 7 trasladables a lunes (Ley Emiliani 51 de 1983) + 5 derivados de Pascua.
// Verificado contra el calendario oficial 2026 y 2027.

import { dateAt, addDays, ymd, type ISODate } from "./dates";

/** Domingo de Pascua por el algoritmo de Gauss/Butcher (calendario gregoriano). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=marzo, 4=abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dateAt(year, month, day);
}

/** Lunes siguiente (o el mismo día si ya es lunes) — traslado Emiliani. */
function nextMonday(d: Date): Date {
  const wd = d.getDay(); // 0=dom..6=sáb
  if (wd === 1) return d;
  const delta = wd === 0 ? 1 : 8 - wd;
  return addDays(d, delta);
}

export interface Holiday {
  date: ISODate;
  name: string;
}

const cache = new Map<number, Map<string, string>>();

/** Mapa ISODate -> nombre del festivo para un año dado. */
export function holidaysMap(year: number): Map<string, string> {
  const hit = cache.get(year);
  if (hit) return hit;

  const e = easterSunday(year);
  const out = new Map<string, string>();
  const put = (d: Date, name: string) => out.set(ymd(d), name);

  // Fijos (no se trasladan)
  put(dateAt(year, 1, 1), "Año Nuevo");
  put(dateAt(year, 5, 1), "Día del Trabajo");
  put(dateAt(year, 7, 20), "Independencia");
  put(dateAt(year, 8, 7), "Batalla de Boyacá");
  put(dateAt(year, 12, 8), "Inmaculada Concepción");
  put(dateAt(year, 12, 25), "Navidad");

  // Trasladables a lunes (Ley Emiliani)
  put(nextMonday(dateAt(year, 1, 6)), "Reyes Magos");
  put(nextMonday(dateAt(year, 3, 19)), "San José");
  put(nextMonday(dateAt(year, 6, 29)), "San Pedro y San Pablo");
  put(nextMonday(dateAt(year, 8, 15)), "Asunción de la Virgen");
  put(nextMonday(dateAt(year, 10, 12)), "Día de la Raza");
  put(nextMonday(dateAt(year, 11, 1)), "Todos los Santos");
  put(nextMonday(dateAt(year, 11, 11)), "Independencia de Cartagena");

  // Derivados de Pascua
  put(addDays(e, -3), "Jueves Santo");
  put(addDays(e, -2), "Viernes Santo");
  put(nextMonday(addDays(e, 43)), "Ascensión del Señor");
  put(nextMonday(addDays(e, 64)), "Corpus Christi");
  put(nextMonday(addDays(e, 71)), "Sagrado Corazón");

  cache.set(year, out);
  return out;
}

export function isHoliday(d: Date): boolean {
  return holidaysMap(d.getFullYear()).has(ymd(d));
}

export function holidayName(d: Date): string | undefined {
  return holidaysMap(d.getFullYear()).get(ymd(d));
}

/** Todos los festivos de un año como lista ordenada. */
export function holidaysOfYear(year: number): Holiday[] {
  return [...holidaysMap(year).entries()]
    .map(([date, name]) => ({ date, name }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
