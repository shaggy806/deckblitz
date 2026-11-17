/**
 * "Tapped creatures you control can block as though they were untapped"
 * (Masako the Humorless): `blocksAsThoughUntapped` lifts rule 509.1a's "the
 * chosen creatures must be untapped" for what it affects, and nothing else
 * (the ruling: no "can't block" creature blocks, no nonflier blocks a flier).
 */
import { describe, expect, it } from "vitest";

import { combatCreatures } from "../bot/combat-math.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, life, spawn, table, toStep, zone } from "./harness.js";

/** `attacker` attacks bob, and the game runs to the declare blockers step —
 * not to bob's block, which isn't asked when nothing of his can block. */
function attackWith(game: Game, a: { declareAttackersFn?: unknown }, attacker: ObjectId): void {
  (a as { declareAttackersFn: () => unknown }).declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.awaiting?.kind === "blockers");
}

describe("Masako the Humorless: tapped creatures you control can block", () => {
  it("a tapped creature of Masako's controller blocks, and is offered as a blocker", () => {
    const { game, a, b } = table();
    const ogre = spawn(game, "Hill Giant"); // 3/3
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Masako the Humorless", B, { tapped: true });
    const offer = blockOffer(game, a, [ogre]);
    expect(offer.eligible.find((x) => x.blocker === bears)?.canBlock).toEqual([ogre]);
    expect(whyCannotBlock(game.state, game.registry, B, bears, ogre)).toBeNull();

    b.declareBlockersFn = () => [{ blocker: bears, attacker: ogre }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard"); // it blocked, and took the Giant's 3
    expect(life(game, B)).toBe(20);
  });

  it("without Masako, or under an opponent's, a tapped creature can't block", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Masako the Humorless", A);
    attackWith(game, a, ogre);
    expect(whyCannotBlock(game.state, game.registry, B, bears, ogre)).toMatch(/tapped/);
    // The bots read it the same way: no blocker for bob.
    expect(combatCreatures(game.state, game.registry, B, true).some((c) => c.id === bears)).toBe(false);
  });

  it("the ruling: a tapped nonflier still can't block a flier, nor a creature that can't block", () => {
    const { game, a } = table();
    const flier = spawn(game, "Wind Drake"); // 2/2 flying
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const goblin = spawn(game, "Hulking Goblin", B, { tapped: true }); // can't block
    spawn(game, "Masako the Humorless", B);
    attackWith(game, a, flier);
    expect(whyCannotBlock(game.state, game.registry, B, bears, flier)).toMatch(/flying/i);
    expect(whyCannotBlock(game.state, game.registry, B, goblin, flier)).toMatch(/can't block/);
    // The bots count bob's tapped Bears as a blocker under his Masako.
    expect(combatCreatures(game.state, game.registry, B, true).find((c) => c.id === bears)?.canBlock).toBe(true);
  });
});
