// Datos semilla — SOLO valores de ejemplo genéricos (nada real del usuario).
// El usuario edita todo en Ajustes. Estos números viven para que la app se vea
// viva la primera vez; jamás se commitea información financiera real.

import { hoy, ymd, addDays } from "../lib/dates";
import { periodNow } from "../lib/periods";
import { DEFAULT_TRANSPORT } from "../lib/transport";
import type {
  Category,
  ChallengeState,
  Debt,
  Expense,
  FixedExpense,
  Goal,
  Salaries,
  ThemeMode,
} from "../lib/types";

export const CATEGORIES: Category[] = [
  { id: "comida", name: "Comida", emoji: "🍔", limit: 300_000 },
  { id: "transporte", name: "Transporte", emoji: "🚌", limit: 0 },
  { id: "mercado", name: "Mercado", emoji: "🛒", limit: 350_000 },
  { id: "ocio", name: "Ocio", emoji: "🎮", limit: 150_000 },
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
  challenge: ChallengeState;
  transport: typeof DEFAULT_TRANSPORT;
  onboarded: boolean;
}

export function seedData(): AppData {
  const p = periodNow();
  const t = hoy();

  const expenses: Expense[] = [
    { id: "e1", date: ymd(addDays(t, -1)), amount: 18_000, category: "comida", note: "Almuerzo", source: "manual" },
    { id: "e2", date: ymd(t), amount: 7_100, category: "transporte", note: "Pasajes ida y vuelta", source: "bus" },
    { id: "e3", date: ymd(addDays(t, -2)), amount: 42_000, category: "ocio", note: "Cine", source: "manual" },
  ];

  const goals: Goal[] = [
    {
      id: "g1",
      name: "Moto",
      emoji: "🏍️",
      target: 6_000_000,
      saved: 1_500_000,
      deadline: ymd(addDays(t, 300)),
      contributions: [{ date: ymd(addDays(t, -20)), amount: 300_000 }],
    },
    {
      id: "g2",
      name: "Fondo de emergencia",
      emoji: "🛟",
      target: 2_000_000,
      saved: 400_000,
      deadline: ymd(addDays(t, 180)),
      contributions: [],
    },
  ];

  const debts: Debt[] = [
    {
      id: "d1",
      name: "Celular",
      emoji: "📱",
      installmentValue: 120_000,
      totalInstallments: 12,
      paidInstallments: 8,
      payPeriod: "primera", // se paga en la quincena del 5
      history: [],
    },
    {
      id: "d2",
      name: "Préstamo familiar",
      emoji: "🤝",
      installmentValue: 200_000,
      totalInstallments: 6,
      paidInstallments: 2,
      payPeriod: "segunda", // se paga en la quincena del 20
      history: [],
    },
  ];

  const fixed: FixedExpense[] = [
    { id: "f1", name: "Plan celular", amount: 45_000, category: "servicios", when: "primera" },
  ];

  const challenge: ChallengeState = {
    active: true,
    baseAmount: 10_000,
    stepAmount: 5_000,
    totalSteps: 20,
    done: [0, 1, 2],
    startedAt: ymd(t),
  };

  return {
    version: 1,
    theme: "auto",
    salaries: { [p.id]: 1_850_000 },
    categories: CATEGORIES,
    expenses,
    fixed,
    goals,
    debts,
    challenge,
    transport: { ...DEFAULT_TRANSPORT },
    onboarded: false,
  };
}
