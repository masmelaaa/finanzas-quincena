// Tipos del dominio de la app.
import type { ISODate } from "./dates";

export type CategoryId =
  | "comida"
  | "transporte"
  | "ocio"
  | "mercado"
  | "servicios"
  | "salud"
  | "deudas"
  | "otros";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Límite por quincena (0 = sin límite). */
  limit: number;
  /** Es un gasto fijo/recurrente que se reserva del disponible. */
}

export interface Expense {
  id: string;
  date: ISODate;
  amount: number;
  category: CategoryId;
  note?: string;
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
  /** En qué quincena se paga esta cuota: "primera" (pago del 5) o "segunda" (pago del 20). */
  payPeriod: "primera" | "segunda";
  history: { date: ISODate; amount: number }[];
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
