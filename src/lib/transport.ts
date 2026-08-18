// Presupuesto de transporte por periodo.
// Modos bus/moto/uber: sale los DÍAS IMPARES + SÁBADOS, menos festivos, y cada
// salida son N viajes a una tarifa fija (por defecto bus $3.550, ida y vuelta).
// Modo "propio": presupuesto fijo de gasolina + parqueadero, no depende de días.

import { addDays, hoy, ymd, type ISODate } from "./dates";
import { holidayName, isHoliday } from "./holidays";
import type { Period } from "./periods";

export type TransportMode = "bus" | "moto" | "uber" | "propio";

export const TRANSPORT_MODES: Record<TransportMode, { label: string; emoji: string; unit: string }> = {
  bus: { label: "Bus", emoji: "🚌", unit: "pasaje" },
  moto: { label: "Moto", emoji: "🏍️", unit: "viaje" },
  uber: { label: "Uber / taxi", emoji: "🚕", unit: "viaje" },
  propio: { label: "Vehículo propio", emoji: "🚗", unit: "" },
};

export interface TransportConfig {
  mode: TransportMode;
  fare: number; // tarifa por viaje (bus/moto/uber)
  ridesPerDay: number; // viajes por salida (ida y vuelta = 2)
  ridesPerSaturday: number; // viajes los sábados (puede diferir)
  includeSundays: boolean; // ¿cuenta los domingos impares como salida?
  gasolina: number; // solo modo "propio": presupuesto de gasolina por quincena
  parqueadero: number; // solo modo "propio": presupuesto de parqueaderos por quincena
}

export const DEFAULT_TRANSPORT: TransportConfig = {
  mode: "bus",
  fare: 3550,
  ridesPerDay: 2,
  ridesPerSaturday: 2,
  includeSundays: false,
  gasolina: 0,
  parqueadero: 0,
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

export interface TransportTotal {
  mode: TransportMode;
  total: number; // lo que se descuenta del Disponible, fijo para toda la quincena
  rides: number; // viajes efectivos (0 en modo propio)
  autoRides: number; // viajes que calcula la regla (0 en modo propio)
  edited: boolean; // true si el usuario ajustó la cantidad de viajes (no aplica a "propio")
  plan: TransportPlan | null; // detalle día a día (null en modo "propio")
}

/**
 * Total de transporte de la quincena, sea cual sea el modo:
 * - bus/moto/uber: viajes (auto o editados) × tarifa.
 * - propio: gasolina + parqueadero, fijo, sin depender de los días del periodo.
 */
export function transportTotalForPeriod(
  period: Period,
  cfg: TransportConfig,
  overrideRides?: number,
): TransportTotal {
  if (cfg.mode === "propio") {
    return {
      mode: "propio",
      total: Math.max(0, cfg.gasolina) + Math.max(0, cfg.parqueadero),
      rides: 0,
      autoRides: 0,
      edited: false,
      plan: null,
    };
  }
  const et = effectiveTransport(period, cfg, overrideRides);
  return { mode: cfg.mode, total: et.cost, rides: et.rides, autoRides: et.autoRides, edited: et.edited, plan: et.plan };
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
