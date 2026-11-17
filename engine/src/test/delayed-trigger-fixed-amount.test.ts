/**
 * "Counter target spell. Clash with an opponent. If you win, at the beginning
 * of your next main phase, you may add an amount of {C} equal to that
 * spell's mana value." (Scattering Stroke): a delayed trigger set up in a
 * clash's `won` branch, after the clash's top-or-bottom questions, still
 * reads its creator's target as the spell last was on the stack — the X it
 * was cast with included (rule 202.3e), as Mana Drain's does. Need key
 * effect:delayed-trigger-fixed-amount.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import { A, B, cast, lands, pickModes, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const colorless = (game: Game): number => poolCounts(game.state.players[A].manaPool).C;

/** Alice casts Fireball for X = 3 at bob, then counters it with Scattering Stroke. */
function strokeAFireball(game: Game): ObjectId {
  lands(game, "Mountain", 4);
  lands(game, "Island", 4);
  const fireball = toHand(game, "Fireball");
  cast(game, fireball, { targets: [ref(B)], x: 3, settle: false });
  cast(game, toHand(game, "Scattering Stroke"), { targets: [ref(fireball)], settle: false });
  settle(game);
  return fireball;
}

/** On to this turn's postcombat main, its delayed trigger resolved. */
function toNextMain(game: Game): void {
  game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
  settle(game);
}

describe("Scattering Stroke", () => {
  it("having won the clash, adds {C} equal to the countered spell's mana value with X at the next main phase", () => {
    const { game, a } = table();
    toLibrary(game, "Craw Wurm", A); // mana value 6 against bob's Wastes
    const fireball = strokeAFireball(game);
    expect(zone(game, fireball)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);
    expect(colorless(game)).toBe(0);
    pickModes(a, 0); // "you may": yes
    toNextMain(game);
    expect(game.state.turn.number).toBe(1);
    expect(colorless(game)).toBe(4);
  });

  it("adds nothing having lost the clash", () => {
    const { game, a } = table();
    toLibrary(game, "Craw Wurm", B);
    const fireball = strokeAFireball(game);
    expect(zone(game, fireball)).toBe("graveyard");
    expect(game.state.delayedTriggers).toHaveLength(0);
    pickModes(a, 0);
    toNextMain(game);
    expect(colorless(game)).toBe(0);
  });

  it("asks as it resolves, and adds none when declined", () => {
    const { game, a } = table();
    toLibrary(game, "Craw Wurm", A);
    strokeAFireball(game);
    pickModes(a);
    toNextMain(game);
    expect(colorless(game)).toBe(0);
    // It was asked, and resolved.
    expect(game.state.delayedTriggers).toHaveLength(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});
