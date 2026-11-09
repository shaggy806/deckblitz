/**
 * What the auto-payer finds: a payable cost whose pips have to go on the
 * right sources.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { parseManaCost } from "../mana.js";
import type { ManaPayment } from "../mana-payment.js";
import { A, B, cast, graveyard, ref, spawn, table, toHand } from "./harness.js";

const planOf = (game: Game, cost: string): ManaPayment | null =>
  (game as unknown as { payMana(p: typeof A, c: ReturnType<typeof parseManaCost>): ManaPayment | null }).payMana(
    A,
    parseManaCost(cost),
  );

describe("a payable cost is always found", () => {
  it("puts the source that alone makes a colour on that colour's pip", () => {
    const { game } = table();
    spawn(game, "Plains", B);
    spawn(game, "Mountain", B);
    spawn(game, "Fellwar Stone");
    spawn(game, "Silent Clearing");
    expect(planOf(game, "{W}{R}")).not.toBeNull();
    const helix = toHand(game, "Lightning Helix");
    cast(game, helix, { targets: [ref(B)] });
    expect(graveyard(game)).toContain(helix);
  });

  it("works through a chain of sources, each with one colour left to it", () => {
    const { game } = table();
    spawn(game, "Plains", B);
    spawn(game, "Island", B);
    spawn(game, "Mountain", B);
    // The Stone could make any of the three; the Tundra only {W} or {U}; the
    // Plains only {W}. Each pip has exactly one way to go round.
    spawn(game, "Fellwar Stone");
    spawn(game, "Tundra");
    spawn(game, "Plains");
    expect(planOf(game, "{W}{U}{R}")).not.toBeNull();
  });

  it("still says no when two pips want the one source", () => {
    const { game } = table();
    spawn(game, "Mountain", B);
    spawn(game, "Fellwar Stone");
    spawn(game, "Silent Clearing");
    expect(planOf(game, "{R}{R}")).toBeNull();
  });
});

