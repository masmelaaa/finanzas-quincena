import { describe, expect, it } from "vitest";
import { dateAt } from "./dates";
import { easterSunday, holidayName, isHoliday, holidaysOfYear } from "./holidays";
import { periodFor, periodLength } from "./periods";
import { DEFAULT_TRANSPORT, transportPlan } from "./transport";

describe("Festivos de Colombia", () => {
  it("Pascua 2026 = 5 de abril, 2027 = 28 de marzo", () => {
    const e26 = easterSunday(2026);
    expect([e26.getMonth() + 1, e26.getDate()]).toEqual([4, 5]);
    const e27 = easterSunday(2027);
    expect([e27.getMonth() + 1, e27.getDate()]).toEqual([3, 28]);
  });

  it("Batalla de Boyacá cae el 7 de agosto (fijo)", () => {
    expect(isHoliday(dateAt(2026, 8, 7))).toBe(true);
    expect(holidayName(dateAt(2026, 8, 7))).toMatch(/Boyac/);
  });

  it("Asunción se traslada al lunes 17 ago 2026", () => {
    expect(isHoliday(dateAt(2026, 8, 15))).toBe(false); // sábado, se traslada
    expect(isHoliday(dateAt(2026, 8, 17))).toBe(true); // lunes
  });

  it("2026 tiene 18 festivos", () => {
    expect(holidaysOfYear(2026).length).toBe(18);
  });
});

describe("Periodos (pago 5 y 20)", () => {
  it("9 ago 2026 → periodo 5–19 ago", () => {
    const p = periodFor(dateAt(2026, 8, 9));
    expect(p.payday).toBe(5);
    expect(p.start.getDate()).toBe(5);
    expect(p.end.getDate()).toBe(19);
    expect(periodLength(p)).toBe(15);
  });

  it("20 ago 2026 → periodo 20 ago – 4 sep (cruza mes)", () => {
    const p = periodFor(dateAt(2026, 8, 20));
    expect(p.payday).toBe(20);
    expect([p.start.getMonth() + 1, p.start.getDate()]).toEqual([8, 20]);
    expect([p.end.getMonth() + 1, p.end.getDate()]).toEqual([9, 4]);
  });

  it("2 ene 2027 → pertenece al periodo 20 dic 2026 – 4 ene 2027 (cruza año)", () => {
    const p = periodFor(dateAt(2027, 1, 2));
    expect(p.start.getFullYear()).toBe(2026);
    expect([p.start.getMonth() + 1, p.start.getDate()]).toEqual([12, 20]);
    expect([p.end.getFullYear(), p.end.getMonth() + 1, p.end.getDate()]).toEqual([
      2027, 1, 4,
    ]);
  });
});

describe("Transporte — valores verificados contra el calendario real", () => {
  it("5–19 ago 2026: 6 salidas, 12 pasajes, $42.600", () => {
    const p = periodFor(dateAt(2026, 8, 9));
    const plan = transportPlan(p, DEFAULT_TRANSPORT);
    expect(plan.totalDays).toBe(6);
    expect(plan.totalRides).toBe(12);
    expect(plan.totalCost).toBe(42_600);
    // Los días exactos: 5,8,11,13,15,19
    expect(plan.days.map((d) => d.date)).toEqual([
      "2026-08-05",
      "2026-08-08",
      "2026-08-11",
      "2026-08-13",
      "2026-08-15",
      "2026-08-19",
    ]);
    // El 7 (Boyacá) se saltó por festivo
    expect(plan.skippedHolidays.some((h) => h.date === "2026-08-07")).toBe(true);
  });

  it("20 ago – 4 sep 2026: 8 salidas, 16 pasajes, $56.800", () => {
    const p = periodFor(dateAt(2026, 8, 20));
    const plan = transportPlan(p, DEFAULT_TRANSPORT);
    expect(plan.totalDays).toBe(8);
    expect(plan.totalRides).toBe(16);
    expect(plan.totalCost).toBe(56_800);
  });

  it("20 dic 2026 – 4 ene 2027: 6 salidas, $42.600 (Navidad y Año Nuevo fuera)", () => {
    const p = periodFor(dateAt(2026, 12, 25));
    const plan = transportPlan(p, DEFAULT_TRANSPORT);
    expect(plan.totalCost).toBe(42_600);
    expect(plan.skippedHolidays.map((h) => h.date)).toEqual(
      expect.arrayContaining(["2026-12-25", "2027-01-01"]),
    );
  });

  it("con domingos activados, 5–19 ago sube a $49.700", () => {
    const p = periodFor(dateAt(2026, 8, 9));
    const plan = transportPlan(p, { ...DEFAULT_TRANSPORT, includeSundays: true });
    expect(plan.totalCost).toBe(49_700);
  });
});
