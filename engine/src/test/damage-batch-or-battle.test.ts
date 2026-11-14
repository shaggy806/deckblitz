/**
 * "Whenever one or more Dragons you control deal combat damage to a player
 * or battle" — the batched damage trigger's `orBattle` (Zurgo and Ojutai):
 * once for each player and each battle dealt combat damage by matching
 * sources in one damage event, however many dealt it (the card's ruling:
 * three Dragons on a player and two on a battle are two triggers). "One of
 * those Dragons" is the trigger's batch, chosen as it resolves, not targeted.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, keywords, lands, nextTurn, pickPermanents, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

const ZURGO = "Zurgo and Ojutai";

/** Alice casts Invasion of Lorwyn: a battle bob protects (two players). */
function invade(game: Game): ObjectId {
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

describe("Zurgo and Ojutai", () => {
  it("has hexproof only on the turn it entered", () => {
    const { game } = table();
    const zurgo = spawn(game, ZURGO);
    expect(keywords(game, zurgo).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(keywords(game, zurgo).has("hexproof")).toBe(false);
  });

  it("triggers once for two Dragons hitting one player, and returns one of them", () => {
    const { game, a } = table();
    const zurgo = spawn(game, ZURGO);
    const whelp = spawn(game, "Dragon Whelp");
    const before = hand(game).length;
    const seen = pickPermanents(a, whelp);
    a.declareAttackersFn = () => [zurgo, whelp].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.players[B].life).toBe(20 - 4 - 2);
    // One look (a card into the hand) and the Whelp back: two more cards.
    expect(hand(game).length).toBe(before + 2);
    expect([...seen.offered].sort()).toEqual([zurgo, whelp].sort());
    expect(zone(game, whelp)).toBe("hand");
    expect(zone(game, zurgo)).toBe("battlefield");
  });

  it("triggers again for a battle dealt damage in the same event", () => {
    const { game, a } = table();
    const battle = invade(game);
    const zurgo = spawn(game, ZURGO);
    const whelp = spawn(game, "Dragon Whelp");
    const before = hand(game).length;
    pickPermanents(a);
    a.declareAttackersFn = () => [
      { attacker: zurgo, defender: B },
      { attacker: whelp, defender: battle },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.objects[battle].counters?.defense).toBe(3);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, whelp)).toBe("battlefield");
  });

  it("doesn't trigger for a non-Dragon hitting a battle", () => {
    const { game, a } = table();
    const battle = invade(game);
    spawn(game, ZURGO, A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    a.declareAttackersFn = () => [{ attacker: bears, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.objects[battle].counters?.defense).toBe(3);
    expect(hand(game).length).toBe(before);
  });
});
