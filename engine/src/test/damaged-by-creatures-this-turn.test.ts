/**
 * "If you've been dealt damage by two or more creatures this turn": the
 * journal word `"damaged-by"` — damage entries to a player, in the damaged
 * player's list, each source once per stint (`oncePerList`), the filter read
 * on the source as it dealt it. Any damage, whoever controlled the creatures,
 * and two different creatures, not one twice (Inferno Trap's rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** `source` deals 1 damage to alice. */
function ping(game: Game, source: ObjectId, by: PlayerId = B): void {
  game.debugApplyEffect(by, { kind: "damage", amount: 1, target: 0 }, [ref(A)], { source });
  settle(game);
}

describe("Inferno Trap", () => {
  it("costs {R} once two different creatures have dealt you damage", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const trap = toHand(game, "Inferno Trap");
    ping(game, spawn(game, "Grizzly Bears", B));
    expect(() => cast(game, trap, { altCost: true, targets: [ref(wurm)], settle: false })).toThrow(/alternative/i);
    ping(game, spawn(game, "Grizzly Bears", B));
    cast(game, trap, { altCost: true, targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, trap)).toBe("graveyard");
  });

  it("isn't opened by one creature twice, or by a noncreature source", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const trap = toHand(game, "Inferno Trap");
    const bears = spawn(game, "Grizzly Bears", B);
    ping(game, bears);
    ping(game, bears);
    ping(game, spawn(game, "Mind Stone", B));
    expect(() => cast(game, trap, { altCost: true, targets: [ref(wurm)], settle: false })).toThrow(/alternative/i);
  });

  it("counts your own creatures, and not damage dealt to another player", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const trap = toHand(game, "Inferno Trap");
    // Damage to bob doesn't count for alice.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(B)], { source: spawn(game, "Grizzly Bears", B) });
    settle(game);
    ping(game, spawn(game, "Grizzly Bears", A), A);
    expect(() => cast(game, trap, { altCost: true, targets: [ref(wurm)], settle: false })).toThrow(/alternative/i);
    ping(game, spawn(game, "Grizzly Bears", B));
    cast(game, trap, { altCost: true, targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
