/**
 * The auto-payer never spends a player's last life on its own, counting all
 * the tolls of one payment together.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { parseManaCost } from "../mana.js";
import type { ManaPayment } from "../mana-payment.js";
import { A, life, spawn, table } from "./harness.js";

const planOf = (game: Game, cost: string): ManaPayment | null =>
  (game as unknown as { payMana(p: typeof A, c: ReturnType<typeof parseManaCost>): ManaPayment | null }).payMana(
    A,
    parseManaCost(cost),
  );
const tollOf = (plan: ManaPayment): number => plan.steps.reduce((n, s) => n + s.pain + s.lifeCost, 0);

describe("the auto-payer doesn't spend the last life", () => {
  it("counts the tolls together", () => {
    const { game } = table({ life: 2 });
    spawn(game, "Silent Clearing");
    spawn(game, "Caves of Koilos");
    expect(planOf(game, "{W}{W}")).toBeNull();
  });

  it("pays them when life is left over", () => {
    const { game } = table({ life: 3 });
    spawn(game, "Silent Clearing");
    spawn(game, "Caves of Koilos");
    const plan = planOf(game, "{W}{W}");
    expect(plan).not.toBeNull();
    expect(tollOf(plan!)).toBe(2);
    expect(life(game)).toBe(3);
  });

  it("takes a toll-free source over a second toll at 2 life", () => {
    const { game } = table({ life: 2 });
    spawn(game, "Silent Clearing");
    spawn(game, "Caves of Koilos");
    spawn(game, "Plains");
    const plan = planOf(game, "{W}{W}");
    expect(plan).not.toBeNull();
    expect(tollOf(plan!)).toBe(1);
  });

  it("still pays the one toll a total can bear", () => {
    const { game } = table({ life: 2 });
    spawn(game, "Silent Clearing");
    expect(tollOf(planOf(game, "{W}")!)).toBe(1);
  });

  it("counts a Phyrexian pip's life with the tolls", () => {
    const short = table({ life: 3 }).game;
    spawn(short, "Silent Clearing");
    expect(planOf(short, "{W/P}{W}")).toBeNull();
    const enough = table({ life: 4 }).game;
    spawn(enough, "Silent Clearing");
    expect(planOf(enough, "{W/P}{W}")).not.toBeNull();
  });

  it("counts a snow pip's toll with the rest of the payment", () => {
    const { game } = table({ life: 2 });
    spawn(game, "Silent Clearing");
    spawn(game, "Snow-Covered Plains");
    spawn(game, "Caves of Koilos");
    // The snow land pays {S}; the other two would each take a point.
    expect(planOf(game, "{S}{W}{W}")).toBeNull();
    expect(tollOf(planOf(game, "{S}{W}")!)).toBe(1);
  });
});
