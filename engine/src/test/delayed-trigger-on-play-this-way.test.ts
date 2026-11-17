/**
 * "Until end of turn, whenever you play a land or cast a spell this way, its
 * owner draws a card" (Apple of Eden, Isu Relic): a permission's `whenCast`
 * with `lands` — the effect's delayed triggered ability (rule 603.7) for each
 * card played under it, a land as it's played (rule 305.1) and a spell as
 * it's cast, the card its trigger object. And a hand exiled face down after
 * a look at it (`exile-graveyard`'s `faceDown: "looked"`): its looker may go
 * on looking at those cards, and play them (rule 406.3).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, graveyard, hand, lands, life, nextTurn, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

/** Alice's Apple, used on bob's hand of these cards. */
function appleOn(cards: readonly string[]) {
  const t = table();
  const { game } = t;
  for (const id of [...hand(game, B)]) game.debugMove(id, "exile");
  const bobs = cards.map((name) => toHand(game, name, B));
  const apple = spawn(game, "Apple of Eden, Isu Relic");
  lands(game, "Island", 4);
  activate(game, apple, 0, { targets: [ref(B)] });
  return { ...t, apple, bobs };
}

describe("Apple of Eden, Isu Relic", () => {
  it("exiles the opponent's hand face down, where its activator can see the cards and its owner can't", () => {
    const { game, apple, bobs } = appleOn(["Grizzly Bears", "Forest", "Lightning Bolt"]);
    expect(life(game)).toBe(16);
    expect(zone(game, apple)).toBe("graveyard");
    expect(hand(game, B)).toEqual([]);
    for (const id of bobs) {
      expect(zone(game, id)).toBe("exile");
      expect(sees(game, A, id)).toBe(true);
      expect(sees(game, B, id)).toBe(false);
    }
  });

  it("a land played and a spell cast from among them each have their owner draw a card, mana of any type paying", () => {
    const { game, bobs } = appleOn(["Grizzly Bears", "Forest", "Lightning Bolt"]);
    const [bears, forest] = bobs;
    const before = hand(game, B).length;
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(A);
    expect(hand(game, B)).toHaveLength(before + 1);
    // {1}{G} paid with Islands.
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, B)).toHaveLength(before + 2);
    expect(hand(game)).not.toContain(bears);
  });

  it("at the next end step, the cards still exiled return to their owner's hand, and none played", () => {
    const { game, bobs } = appleOn(["Grizzly Bears", "Forest", "Lightning Bolt"]);
    const [bears, forest, bolt] = bobs;
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("hand");
    expect(game.state.objects[bolt].owner).toBe(B);
    expect(hand(game, B)).toContain(bolt);
    expect(hand(game, B)).toContain(bears);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("the permission and the trigger last the turn: nothing played on a later one", () => {
    const { game, bobs } = appleOn(["Forest", "Lightning Bolt"]);
    const [forest] = bobs;
    nextTurn(game);
    nextTurn(game);
    // Back in bob's hand at the end step, and alice can't play it now.
    expect(zone(game, forest)).toBe("hand");
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).not.toBeNull();
  });

  it("a card not played this way triggers nothing", () => {
    const { game } = appleOn(["Lightning Bolt"]);
    const forest = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const before = hand(game, B).length;
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    cast(game, bears);
    expect(hand(game, B)).toHaveLength(before);
    expect(graveyard(game, B)).toEqual([]);
  });
});
