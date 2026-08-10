// Estado inicial de la app. Se entrega VACÍA: el usuario registra todo desde cero.
// Lo único precargado son las categorías (la taxonomía) sin límites, y la config
// de transporte por defecto (que igual se confirma en el onboarding).

import { hoy, ymd } from "../lib/dates";
import { DEFAULT_TRANSPORT } from "../lib/transport";
import type {
  Category,
  ChallengeState,
  CreditCard,
  Debt,
  Expense,
  Extra,
  FixedExpense,
  Goal,
  Salaries,
  ThemeMode,
} from "../lib/types";

export const CATEGORIES: Category[] = [
  { id: "comida", name: "Comida", emoji: "🍔", limit: 0 },
  { id: "transporte", name: "Transporte", emoji: "🚌", limit: 0 },
  { id: "mercado", name: "Mercado", emoji: "🛒", limit: 0 },
  { id: "ocio", name: "Ocio", emoji: "🎮", limit: 0 },
  { id: "servicios", name: "Servicios", emoji: "💡", limit: 0 },
  { id: "salud", name: "Salud", emoji: "💊", limit: 0 },
  { id: "deudas", name: "Deudas", emoji: "🏦", limit: 0 },
  { id: "otros", name: "Otros", emoji: "✨", limit: 0 },
];

export interface AppData {
  version: number;
  theme: ThemeMode;
  salaries: Salaries;
  categories: Category[];
  expenses: Expense[];
  fixed: FixedExpense[];
  goals: Goal[];
  debts: Debt[];
  extras: Extra[];
  creditCards: CreditCard[];
  /** Bote general de ahorro: extras que no se dirigieron a una meta puntual. */
  savingsPot: number;
  /** Ajuste manual de pasajes por quincena (period.id → pasajes). Si falta, se usa el cálculo automático. */
  transportOverrides: Record<string, number>;
  challenge: ChallengeState;
  transport: typeof DEFAULT_TRANSPORT;
  onboarded: boolean;
}

/** Reto de ahorro listo para empezar (sin pasos completados). */
const emptyChallenge: ChallengeState = {
  active: true,
  baseAmount: 10_000,
  stepAmount: 5_000,
  totalSteps: 20,
  done: [],
  startedAt: ymd(hoy()),
};

export function seedData(): AppData {
  return {
    version: 2,
    theme: "auto",
    salaries: {},
    categories: CATEGORIES.map((c) => ({ ...c })),
    expenses: [],
    fixed: [],
    goals: [],
    debts: [],
    extras: [],
    creditCards: [],
    savingsPot: 0,
    transportOverrides: {},
    challenge: emptyChallenge,
    transport: { ...DEFAULT_TRANSPORT },
    onboarded: false,
  };
}
