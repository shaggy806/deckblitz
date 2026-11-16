/**
 * Island Sanctuary: "If you would draw a card during your draw step, instead
 * you may skip that draw. If you do, until your next turn, you can't be
 * attacked except by creatures with flying and/or islandwalk." The optional
 * `would-draw` replacement (rule 614.1a) gated to its controller's draw step,
 * and a timed `cant-attack` rule at the player (rule 508.1c) over every
 * creature without flying and without islandwalk, later arrivals included
 * (rule 611.2c).
 */

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, destroy, hand, named, nextTurn, registryOf, settle, spawn, table } from "./harness.js";

/** Alice skips (or draws) whenever the Sanctuary asks; what she was asked. */
function answer(seat: ScriptedController, skip: () => boolean): string[][] {
  const asked: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    return [skip() ? texts.findIndex((t) => t.startsWith("Island Sanctuary")) : texts.indexOf("Draw a card")];
  };
  return asked;
}

const can = (game: Game, attacker: ObjectId, defender: PlayerId | ObjectId, by: PlayerId = B): boolean =>
  whyCannotAttack(game.state, registryOf(game), by, attacker, defender) === null;

/** Bob's creatures, ready to attack. */
const ready = (game: Game, name: string, player: PlayerId = B): ObjectId => spawn(game, name, player);

describe("Island Sanctuary", () => {
  it("skips the draw-step draw, and until your next turn only flyers and islandwalkers can attack you", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Island Sanctuary");
    const walker = spawn(game, "Jace Beleren");
    let skip = true;
    const asked = answer(a, () => skip);
    nextTurn(game);
    const before = hand(game, A).length;
    // Bob's turn, then Carol's, then Alice's draw step: asked, and skipped.
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(asked).toEqual([["Draw a card", expect.stringMatching(/^Island Sanctuary: skip that draw/)]]);
    expect(hand(game, A).length).toBe(before);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    const bears = ready(game, "Grizzly Bears");
    const drake = ready(game, "Wind Drake");
    const leviathan = ready(game, "Segovian Leviathan");
    expect(can(game, bears, A)).toBe(false);
    expect(can(game, drake, A)).toBe(true);
    expect(can(game, leviathan, A)).toBe(true);
    // Only Alice herself: her planeswalker and the other player can be.
    expect(can(game, bears, walker)).toBe(true);
    expect(can(game, bears, C)).toBe(true);
    // The Sanctuary gone, the restriction stays: it was the skip's.
    destroy(game, named(game, "Island Sanctuary", A)[0]);
    expect(can(game, bears, A)).toBe(false);
    // Carol's turn, then Alice's next turn (where she draws): over.
    nextTurn(game);
    expect(can(game, ready(game, "Grizzly Bears", C), A, C)).toBe(false);
    skip = false;
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(can(game, bears, A)).toBe(true);
  });

  it("declined, the card is drawn and nothing is restricted", () => {
    const { game, a } = table();
    spawn(game, "Island Sanctuary");
    const asked = answer(a, () => false);
    nextTurn(game);
    const before = hand(game, A).length;
    nextTurn(game);
    expect(asked).toHaveLength(1);
    expect(hand(game, A).length).toBe(before + 1);
    nextTurn(game);
    expect(can(game, ready(game, "Grizzly Bears"), A)).toBe(true);
  });

  it("isn't asked about a draw outside your draw step, or another player's", () => {
    const { game, a } = table();
    spawn(game, "Island Sanctuary");
    const asked = answer(a, () => true);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
    // Bob's draw step: his draw, not Alice's.
    nextTurn(game);
    expect(asked).toEqual([]);
  });
});
