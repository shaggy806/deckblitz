/**
 * "Target player **other than this artifact's owner**" (Crown of Doom): an
 * `other` player slot `than: "source-owner"`. Ownership never changes (rule
 * 108.3), so whoever controls it may hand it to anyone but its owner.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, controller, lands, pt, ref, spawn, table, toStep } from "./harness.js";

describe("Crown of Doom — a player other than its owner", () => {
  it("its owner can't be targeted, by its owner or by whoever controls it now", () => {
    const { game } = table({ players: 3 });
    const crown = spawn(game, "Crown of Doom");
    lands(game, "Wastes", 2);
    // Its owner, alice herself, isn't a legal target.
    expect(() => activate(game, crown, 0, { targets: [ref(A)] })).toThrow();
    activate(game, crown, 0, { targets: [ref(B)] });
    expect(controller(game, crown)).toBe(B);
    // Bob's turn: he may pass it on, but never back to alice, its owner.
    toStep(game, "precombat-main", B);
    lands(game, "Wastes", 2, B);
    expect(() => activate(game, crown, 0, { player: B, targets: [ref(A)] })).toThrow();
    activate(game, crown, 0, { player: B, targets: [ref(C)] });
    expect(controller(game, crown)).toBe(C);
  });

  it("only during its controller's turn", () => {
    const { game } = table({ players: 2 });
    const crown = spawn(game, "Crown of Doom");
    lands(game, "Wastes", 2);
    toStep(game, "precombat-main", B);
    expect(() => activate(game, crown, 0, { targets: [ref(B)] })).toThrow();
    expect(controller(game, crown)).toBe(A);
  });

  it("a creature attacking its controller gets +2/+0", () => {
    const { game, b } = table({ players: 2 });
    spawn(game, "Crown of Doom");
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});
