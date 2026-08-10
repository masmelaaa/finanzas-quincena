import { create } from "zustand";
import { persist } from "zustand/middleware";
import { hoy, ymd } from "../lib/dates";
import { periodNow } from "../lib/periods";
import type {
  Category,
  CategoryId,
  CreditCard,
  Debt,
  Expense,
  Extra,
  FixedExpense,
  Goal,
  ThemeMode,
} from "../lib/types";
import type { TransportConfig } from "../lib/transport";
import { seedData, type AppData } from "./seed";

const uid = () => Math.random().toString(36).slice(2, 10);

interface Store extends AppData {
  // Sueldo
  setSalary: (periodId: string, amount: number) => void;
  // Gastos
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void;
  removeExpense: (id: string) => void;
  // Categorías / límites
  setCategoryLimit: (id: CategoryId, limit: number) => void;
  setCategories: (c: Category[]) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: CategoryId, patch: Partial<Omit<Category, "id">>) => void;
  removeCategory: (id: CategoryId) => void;
  // Fijos
  addFixed: (f: Omit<FixedExpense, "id">) => void;
  removeFixed: (id: string) => void;
  // Metas
  addGoal: (g: Omit<Goal, "id" | "contributions" | "saved"> & { saved?: number }) => void;
  contributeGoal: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;
  // Deudas
  addDebt: (d: Omit<Debt, "id" | "history" | "paidInstallments"> & { paidInstallments?: number }) => void;
  payInstallment: (id: string) => void;
  undoInstallment: (id: string) => void;
  removeDebt: (id: string) => void;
  // Extras (ingresos fuera de nómina → van full al ahorro)
  addExtra: (e: Omit<Extra, "id">) => void;
  removeExtra: (id: string) => void;
  // Tarjetas de crédito (cupo vs. gastado)
  addCard: (c: Omit<CreditCard, "id" | "history">) => void;
  updateCard: (id: string, patch: Partial<Pick<CreditCard, "name" | "limit" | "emoji">>) => void;
  cardCharge: (id: string, amount: number) => void; // registrar consumo
  cardPayment: (id: string, amount: number) => void; // registrar pago
  removeCard: (id: string) => void;
  // Reto
  toggleChallengeStep: (index: number) => void;
  setChallenge: (patch: Partial<AppData["challenge"]>) => void;
  // Transporte
  setTransport: (patch: Partial<TransportConfig>) => void;
  setTransportOverride: (periodId: string, rides: number) => void;
  clearTransportOverride: (periodId: string) => void;
  // Tema
  setTheme: (t: ThemeMode) => void;
  // Onboarding
  finishOnboarding: () => void;
  // Datos
  exportJSON: () => string;
  importJSON: (raw: string) => boolean;
  resetAll: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seedData(),

      setSalary: (periodId, amount) =>
        set((s) => ({ salaries: { ...s.salaries, [periodId]: Math.max(0, amount) } })),

      addExpense: (e) =>
        set((s) => ({ expenses: [{ ...e, id: uid() }, ...s.expenses] })),

      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      setCategoryLimit: (id, limit) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, limit: Math.max(0, limit) } : c,
          ),
        })),

      setCategories: (categories) => set({ categories }),

      addCategory: (c) =>
        set((s) => ({
          categories: [...s.categories, { ...c, id: uid(), limit: Math.max(0, c.limit) }],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      removeCategory: (id) =>
        set((s) => {
          if (s.categories.length <= 1) return s; // siempre queda al menos una
          const fallback = s.categories.find((c) => c.id !== id)?.id ?? id;
          return {
            categories: s.categories.filter((c) => c.id !== id),
            // reasigna los gastos y fijos de esa categoría a la primera disponible
            expenses: s.expenses.map((e) => (e.category === id ? { ...e, category: fallback } : e)),
            fixed: s.fixed.map((f) => (f.category === id ? { ...f, category: fallback } : f)),
          };
        }),

      addFixed: (f) => set((s) => ({ fixed: [...s.fixed, { ...f, id: uid() }] })),
      removeFixed: (id) => set((s) => ({ fixed: s.fixed.filter((f) => f.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [
            ...s.goals,
            { ...g, id: uid(), saved: g.saved ?? 0, contributions: [] },
          ],
        })),

      contributeGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  saved: Math.min(g.target, g.saved + amount),
                  contributions: [
                    { date: ymd(hoy()), amount },
                    ...g.contributions,
                  ],
                }
              : g,
          ),
          // el aporte también se registra como movimiento
          expenses: [
            {
              id: uid(),
              date: ymd(hoy()),
              amount,
              category: "otros" as CategoryId,
              note: `Aporte a meta`,
              source: "aporte",
            },
            ...s.expenses,
          ],
        })),

      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addDebt: (d) =>
        set((s) => ({
          debts: [
            ...s.debts,
            { ...d, id: uid(), paidInstallments: d.paidInstallments ?? 0, history: [] },
          ],
        })),

      payInstallment: (id) =>
        set((s) => {
          const debt = s.debts.find((d) => d.id === id);
          if (!debt || debt.paidInstallments >= debt.totalInstallments) return s;
          const iso = ymd(hoy());
          return {
            debts: s.debts.map((d) =>
              d.id === id
                ? {
                    ...d,
                    paidInstallments: d.paidInstallments + 1,
                    history: [{ date: iso, amount: d.installmentValue }, ...d.history],
                  }
                : d,
            ),
            expenses: [
              {
                id: uid(),
                date: iso,
                amount: debt.installmentValue,
                category: "deudas" as CategoryId,
                note: `Cuota ${debt.paidInstallments + 1}/${debt.totalInstallments} · ${debt.name}`,
                source: "cuota",
              },
              ...s.expenses,
            ],
          };
        }),

      undoInstallment: (id) =>
        set((s) => {
          const debt = s.debts.find((d) => d.id === id);
          if (!debt || debt.paidInstallments <= 0) return s;
          const last = debt.history[0];
          return {
            debts: s.debts.map((d) =>
              d.id === id
                ? {
                    ...d,
                    paidInstallments: d.paidInstallments - 1,
                    history: d.history.slice(1),
                  }
                : d,
            ),
            // quitamos el último gasto de cuota de esa deuda
            expenses: last
              ? s.expenses.filter(
                  (e) =>
                    !(
                      e.source === "cuota" &&
                      e.date === last.date &&
                      e.amount === last.amount &&
                      e.note?.includes(debt.name)
                    ),
                )
              : s.expenses,
          };
        }),

      removeDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      addExtra: (e) =>
        set((s) => {
          const extra: Extra = { ...e, id: uid() };
          // Regla: TODO extra va 100% al ahorro.
          if (extra.goalId && s.goals.some((g) => g.id === extra.goalId)) {
            // dirigido a una meta concreta
            return {
              extras: [extra, ...s.extras],
              goals: s.goals.map((g) =>
                g.id === extra.goalId
                  ? {
                      ...g,
                      saved: Math.min(g.target, g.saved + extra.amount),
                      contributions: [{ date: extra.date, amount: extra.amount }, ...g.contributions],
                    }
                  : g,
              ),
            };
          }
          // sin meta → al bote general de ahorro
          return {
            extras: [extra, ...s.extras],
            savingsPot: s.savingsPot + extra.amount,
          };
        }),

      removeExtra: (id) =>
        set((s) => {
          const extra = s.extras.find((e) => e.id === id);
          if (!extra) return s;
          if (extra.goalId && s.goals.some((g) => g.id === extra.goalId)) {
            return {
              extras: s.extras.filter((e) => e.id !== id),
              goals: s.goals.map((g) =>
                g.id === extra.goalId
                  ? { ...g, saved: Math.max(0, g.saved - extra.amount) }
                  : g,
              ),
            };
          }
          return {
            extras: s.extras.filter((e) => e.id !== id),
            savingsPot: Math.max(0, s.savingsPot - extra.amount),
          };
        }),

      addCard: (c) =>
        set((s) => ({
          creditCards: [
            ...s.creditCards,
            { ...c, id: uid(), used: Math.max(0, c.used), history: [] },
          ],
        })),

      updateCard: (id, patch) =>
        set((s) => ({
          creditCards: s.creditCards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      cardCharge: (id, amount) =>
        set((s) => ({
          creditCards: s.creditCards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  used: c.used + Math.max(0, amount),
                  history: [{ date: ymd(hoy()), amount, type: "consumo" }, ...c.history],
                }
              : c,
          ),
        })),

      cardPayment: (id, amount) =>
        set((s) => ({
          creditCards: s.creditCards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  used: Math.max(0, c.used - Math.max(0, amount)),
                  history: [{ date: ymd(hoy()), amount, type: "pago" }, ...c.history],
                }
              : c,
          ),
        })),

      removeCard: (id) =>
        set((s) => ({ creditCards: s.creditCards.filter((c) => c.id !== id) })),

      toggleChallengeStep: (index) =>
        set((s) => {
          const done = s.challenge.done.includes(index)
            ? s.challenge.done.filter((i) => i !== index)
            : [...s.challenge.done, index];
          return { challenge: { ...s.challenge, done } };
        }),

      setChallenge: (patch) =>
        set((s) => ({ challenge: { ...s.challenge, ...patch } })),

      setTransport: (patch) =>
        set((s) => ({ transport: { ...s.transport, ...patch } })),

      setTransportOverride: (periodId, rides) =>
        set((s) => ({
          transportOverrides: { ...s.transportOverrides, [periodId]: Math.max(0, Math.round(rides)) },
        })),

      clearTransportOverride: (periodId) =>
        set((s) => {
          const next = { ...s.transportOverrides };
          delete next[periodId];
          return { transportOverrides: next };
        }),

      setTheme: (theme) => set({ theme }),

      finishOnboarding: () => set({ onboarded: true }),

      exportJSON: () => {
        const s = get();
        const data: AppData = {
          version: s.version,
          theme: s.theme,
          salaries: s.salaries,
          categories: s.categories,
          expenses: s.expenses,
          fixed: s.fixed,
          goals: s.goals,
          debts: s.debts,
          extras: s.extras,
          creditCards: s.creditCards,
          savingsPot: s.savingsPot,
          transportOverrides: s.transportOverrides,
          challenge: s.challenge,
          transport: s.transport,
          onboarded: s.onboarded,
        };
        return JSON.stringify(data, null, 2);
      },

      importJSON: (raw) => {
        try {
          const data = JSON.parse(raw) as Partial<AppData>;
          if (!data || typeof data !== "object") return false;
          set((s) => ({ ...s, ...data }));
          return true;
        } catch {
          return false;
        }
      },

      resetAll: () => set({ ...seedData() }),
    }),
    {
      name: "quincena-v2",
      version: 2,
    },
  ),
);

/** Hook de conveniencia: el periodo actual (recalculado en cada render). */
export function useCurrentPeriod() {
  return periodNow();
}
