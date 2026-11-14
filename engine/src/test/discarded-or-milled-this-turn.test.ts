/**
 * "Target card in a graveyard that was discarded or put there from a library
 * this turn" — `anyOf` of the `discardedThisTurn` and
 * `putIntoGraveyardFromLibraryThisTurn` filters: a card discarded or milled
 * this turn, still the same object (rule 400.7), never one that died or was
 * discarded on an earlier turn (the ruling). Ghost of Ramirez DePietro,
 * written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, blockOffer, hand, nextTurn, ref, settle, spawn, table, toHand, watchTargets, zone } from "./harness.js";

const GHOST = "Ghost of Ramirez DePietro";

const discardHand = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "discard-hand", who: "you" });
  settle(game);
};
const mill = (game: Game, player: PlayerId): ObjectId => {
  const top = game.state.zones.perPlayer[player].library[0]!;
  game.debugApplyEffect(player, { kind: "mill", target: "you", amount: 1 });
  settle(game);
  return top;
};

describe("Ghost of Ramirez DePietro", () => {
  it("returns a card discarded or milled this turn to its owner's hand — not one that died, or was discarded before", () => {
    const { game, a } = table();
    const ghost = spawn(game, GHOST, A);
    const old = toHand(game, "Hill Giant", B);
    discardHand(game, B);
    nextTurn(game);
    nextTurn(game);
    // Alice's turn 3: Bob discards and mills, and a creature of his dies.
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    const discarded = toHand(game, "Grizzly Bears", B);
    discardHand(game, B);
    const milled = mill(game, B);
    const died = spawn(game, "Llanowar Elves", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(died)]);
    settle(game);
    const seen = watchTargets(a, (offered) => [offered[0]?.includes(discarded) ? discarded : null]);
    attack(game, a, [ghost]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([discarded, milled]));
    expect(seen.offered[0]).not.toContain(died);
    expect(seen.offered[0]).not.toContain(old);
    expect(zone(game, discarded)).toBe("hand");
    expect(game.state.objects[discarded].owner).toBe(B);
  });

  it("can't be blocked by a creature with toughness 3 or greater", () => {
    const { game, a } = table();
    const ghost = spawn(game, GHOST, A);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    blockOffer(game, a, [ghost]);
    expect(() =>
      game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: giant, attacker: ghost }] }),
    ).toThrow(/block/i);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: ghost }] });
    expect(game.state.objects[bears].blocking).toBe(ghost);
  });
});
