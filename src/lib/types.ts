// Tipos del dominio de la app.
import type { ISODate } from "./dates";

// Las categorías son editables por el usuario, así que el id es un string libre.
// Las de fábrica usan ids legibles ("comida", "transporte"…); las nuevas, un id generado.
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Límite por quincena (0 = sin límite). */
  limit: number;
}

/** Cómo y cuándo te pagan. */
export type PaySchedule =
  | { kind: "quincenal"; days: [number, number] } // dos días del mes, ej. [5, 20]
  | { kind: "semanal"; weekday: number; everyWeeks: 1 | 2; anchor?: ISODate } // 0=domingo..6=sábado
  | { kind: "mensual"; day: number }; // día del mes (se ajusta si el mes es más corto)

/** Forma de pago / ubicación del dinero. */
export type PayMethod = "digital" | "efectivo";

export interface Expense {
  id: string;
  date: ISODate;
  amount: number;
  category: CategoryId;
  note?: string;
  /** Digital (banco/tarjeta) o efectivo. Por defecto digital. */
  method?: PayMethod;
  /** Marca de origen para trazabilidad (ej. "bus", "cuota-deuda"). */
  source?: "manual" | "bus" | "cuota" | "aporte";
}

/** Gasto fijo recurrente del periodo (arriendo, plan celular, etc.). */
export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  /** En qué periodos aplica: "ambas" | "primera" (pago 5) | "segunda" (pago 20). */
  when: "ambas" | "primera" | "segunda";
}

/** Sueldo registrado por periodo. Clave = period.id. */
export type Salaries = Record<string, number>;

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  /** Fecha objetivo (ISO) para calcular aporte por quincena. */
  deadline?: ISODate;
  /** Historial de aportes. */
  contributions: { date: ISODate; amount: number }[];
}

export interface Debt {
  id: string;
  name: string;
  emoji: string;
  installmentValue: number; // valor de cada cuota
  totalInstallments: number;
  paidInstallments: number;
  /** En qué slot de pago cae esta cuota: "primera" o "segunda" (solo aplica con pago quincenal). */
  payPeriod: "primera" | "segunda";
  history: { date: ISODate; amount: number }[];
}

/** Plata que le prestaste a alguien y te deben devolver ("me deben"). */
export interface Loan {
  id: string;
  person: string; // a quién le prestaste
  emoji: string;
  amount: number; // monto total prestado
  paidBack: number; // cuánto te han devuelto
  date: ISODate;
  note?: string;
  dueDate?: ISODate;
  history: { date: ISODate; amount: number }[]; // abonos recibidos
}

/**
 * Ingreso adicional fuera de nómina (regalo, venta, hora extra, propina…).
 * Por regla, todo extra va 100% al ahorro. Puede dirigirse a una meta concreta
 * o al "bote" general de ahorro (goalId undefined).
 */
export interface Extra {
  id: string;
  date: ISODate;
  amount: number;
  concept: string; // "Venta", "Regalo", "Hora extra"…
  emoji: string;
  /** Destino del extra: "sueldo" (suma al disponible), "ahorro" (bote), o una meta. */
  dest: "sueldo" | "ahorro" | "meta";
  goalId?: string; // solo si dest === "meta"
  periodId?: string; // solo si dest === "sueldo" (a qué quincena se suma)
  /** Digital o efectivo. */
  method?: PayMethod;
}

/**
 * Tarjeta de crédito: registra el cupo total y cuánto llevas gastado (saldo usado).
 * No afecta el "Disponible" en efectivo — es un tracker aparte de tu cupo.
 */
export interface CreditCard {
  id: string;
  name: string;
  emoji: string;
  limit: number; // cupo total
  used: number; // cuánto has gastado / saldo usado
  history: { date: ISODate; amount: number; type: "consumo" | "pago" }[];
}

/** Reto de ahorro escalonado (casillas crecientes). */
export interface ChallengeState {
  active: boolean;
  baseAmount: number; // aporte del primer paso
  stepAmount: number; // cuánto crece cada paso
  totalSteps: number;
  /** Índices de pasos completados. */
  done: number[];
  startedAt: ISODate;
}

export type ThemeMode = "auto" | "light" | "dark";
