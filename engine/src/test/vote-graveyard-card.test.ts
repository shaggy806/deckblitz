/**
 * A vote for a card in a graveyard (rule 701.38): the `vote` effect's
 * `{ graveyardCard }`, each vote a `choose-from-zone` of the effect
 * controller's graveyard kept for the vote, and `for-each-voted` acting on
 * the cards still there.
 *
 * Proving card: Custodi Squire.
 */

import { describe, expect, it } from "vitest";
import { ScriptedController } from "../controller.js";
import { answeringPlayer, isVoteQuestion } from "../player-control.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, hand, lands, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const voted = (game: ReturnType<typeof table>["game"]): readonly { voter: string; object?: ObjectId }[] => {
  const done = game.state.eventLog.find((e) => e.type === "votes-finished");
  return done?.type === "votes-finished"
    ? done.votes.map((v) => ({ voter: v.voter, ...("object" in v.choice ? { object: v.choice.object } : {}) }))
    : [];
};

describe("Custodi Squire", () => {
  it("each player votes for a card in your graveyard, starting with you; the card with the most votes returns", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const bolt = toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Hill Giant", B);
    lands(game, "Plains", 5);
    const order: string[] = [];
    const asked: Record<string, readonly ObjectId[]> = {};
    for (const [seat, pick] of [
      [a, bears],
      [b, ring],
      [c, bears],
    ] as const) {
      seat.chooseFromZoneFn = (view, eligible) => {
        order.push(view.player);
        asked[view.player] = eligible;
        return [pick];
      };
    }
    cast(game, toHand(game, "Custodi Squire"));
    expect(order).toEqual([A, B, C]);
    // Only your graveyard's artifact, creature or enchantment cards.
    expect([...asked[B]].sort()).toEqual([bears, ring].sort());
    expect(voted(game)).toEqual([
      { voter: A, object: bears },
      { voter: B, object: ring },
      { voter: C, object: bears },
    ]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("every card tied for most votes returns", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Plains", 5);
    a.chooseFromZoneFn = () => [bears];
    b.chooseFromZoneFn = () => [ring];
    const before = hand(game).length;
    cast(game, toHand(game, "Custodi Squire"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    // Two back, the Squire itself cast.
    expect(hand(game).length).toBe(before + 2);
  });

  it("with nothing to vote for, no one votes", () => {
    const { game, a, b } = table();
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Plains", 5);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    b.chooseFromZoneFn = a.chooseFromZoneFn;
    cast(game, toHand(game, "Custodi Squire"));
    expect(asked).toBe(0);
    expect(voted(game)).toEqual([]);
  });

  it("a card that left the graveyard before the votes were counted isn't returned", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Plains", 5);
    a.chooseFromZoneFn = () => [bears];
    b.chooseFromZoneFn = () => {
      // Gone, and back: a new object (rule 400.7).
      game.debugMove(bears, "exile");
      game.debugMove(bears, "graveyard");
      return [ring];
    };
    cast(game, toHand(game, "Custodi Squire"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("hand");
  });

  it("an additional vote you get is a second pick (Brago's Representative)", () => {
    const { game, a, b } = table();
    spawn(game, "Brago's Representative", A);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Plains", 5);
    let picks = 0;
    a.chooseFromZoneFn = () => {
      picks += 1;
      return [bears];
    };
    b.chooseFromZoneFn = () => [ring];
    cast(game, toHand(game, "Custodi Squire"));
    expect(picks).toBe(2);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("is a vote another player can be choosing (Illusion of Choice)", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 5);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Illusion of Choice"));
    const asBob = new ScriptedController(B);
    let forBob = 0;
    asBob.chooseFromZoneFn = (_view, eligible) => {
      forBob += 1;
      expect(isVoteQuestion(game.state)).toBe(true);
      expect(answeringPlayer(game.state, B)).toBe(A);
      return [eligible[0]];
    };
    a.standInFn = () => asBob;
    a.chooseFromZoneFn = () => [bears];
    b.chooseFromZoneFn = () => {
      throw new Error("asked of bob, answered by alice");
    };
    cast(game, toHand(game, "Custodi Squire"));
    expect(forBob).toBe(1);
    expect(zone(game, bears)).toBe("hand");
  });
});
