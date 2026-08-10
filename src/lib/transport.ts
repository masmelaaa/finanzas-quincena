// Presupuesto de transporte (buses) por periodo.
// Regla del usuario: sale los DÍAS IMPARES + SÁBADOS, menos festivos.
// Cada salida son N pasajes (2 por defecto: ida y vuelta) a $3.550 c/u.

import { addDays, hoy, ymd, type ISODate } from "./dates";
import { holidayName, isHoliday } from "./holidays";
import type { Period } from "./periods";

export interface TransportConfig {
  fare: number; // valor del pasaje
  ridesPerDay: number; // pasajes por salida (ida y vuelta = 2)
  ridesPerSaturday: number; // pasajes los sábados (puede diferir)
  includeSundays: boolean; // ¿cuenta los domingos impares como salida?
}

export const DEFAULT_TRANSPORT: TransportConfig = {
  fare: 3550,
  ridesPerDay: 2,
  ridesPerSaturday: 2,
  includeSundays: false,
};

export interface TransportDay {
  date: ISODate;
  weekday: number; // 0..6
  isSaturday: boolean;
  rides: number;
  cost: number;
  reason: "impar" | "sábado";
}

export interface TransportPlan {
  days: TransportDay[];
  totalDays: number;
  totalRides: number;
  totalCost: number;
  skippedHolidays: { date: ISODate; name: string }[]; // días que habrían contado pero son festivo
}

/** ¿Este día cuenta como salida (antes de descontar festivos)? */
function wouldRide(d: Date, cfg: TransportConfig): "impar" | "sábado" | null {
  const wd = d.getDay();
  if (wd === 6) return "sábado";
  if (wd === 0 && !cfg.includeSundays) return null; // domingo no cuenta salvo config
  if (d.getDate() % 2 === 1) return "impar";
  return null;
}

/** Calcula el plan de transporte para un periodo completo. */
export function transportPlan(period: Period, cfg: TransportConfig): TransportPlan {
  const days: TransportDay[] = [];
  const skippedHolidays: { date: ISODate; name: string }[] = [];

  let cur = new Date(period.start);
  while (ymd(cur) <= ymd(period.end)) {
    const reason = wouldRide(cur, cfg);
    if (reason) {
      if (isHoliday(cur)) {
        skippedHolidays.push({ date: ymd(cur), name: holidayName(cur) ?? "Festivo" });
      } else {
        const isSat = cur.getDay() === 6;
        const rides = isSat ? cfg.ridesPerSaturday : cfg.ridesPerDay;
        days.push({
          date: ymd(cur),
          weekday: cur.getDay(),
          isSaturday: isSat,
          rides,
          cost: rides * cfg.fare,
          reason,
        });
      }
    }
    cur = addDays(cur, 1);
  }

  const totalRides = days.reduce((s, d) => s + d.rides, 0);
  return {
    days,
    totalDays: days.length,
    totalRides,
    totalCost: totalRides * cfg.fare,
    skippedHolidays,
  };
}

export interface EffectiveTransport {
  plan: TransportPlan;
  autoRides: number; // pasajes que calcula la regla
  rides: number; // pasajes efectivos (editados o automáticos)
  cost: number; // rides * fare
  edited: boolean; // true si el usuario ajustó la cantidad
}

/**
 * Transporte efectivo de un periodo: usa el ajuste manual del usuario si existe,
 * o el cálculo automático (impares + sábados − festivos) si no.
 */
export function effectiveTransport(
  period: Period,
  cfg: TransportConfig,
  overrideRides?: number,
): EffectiveTransport {
  const plan = transportPlan(period, cfg);
  const autoRides = plan.totalRides;
  const edited = overrideRides != null && overrideRides !== autoRides;
  const rides = overrideRides != null ? Math.max(0, overrideRides) : autoRides;
  return { plan, autoRides, rides, cost: rides * cfg.fare, edited };
}

/**
 * De un plan, cuánto transporte queda por gastar desde "ref" (hoy) hasta el fin
 * del periodo. Sirve para "reservar" ese dinero en el Disponible real.
 */
export function transportRemaining(
  plan: TransportPlan,
  ref: Date = hoy(),
): { days: number; rides: number; cost: number } {
  const refISO = ymd(ref);
  const future = plan.days.filter((d) => d.date >= refISO);
  const rides = future.reduce((s, d) => s + d.rides, 0);
  return {
    days: future.length,
    rides,
    cost: future.reduce((s, d) => s + d.cost, 0),
  };
}
