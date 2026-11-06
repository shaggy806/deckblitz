/**
 * "You may cast the discarded card" — `cast-now`'s `from: "discarded-this-way"`: the
 * card this resolution had discarded, found where the discard put it, a public zone
 * (rule 400.7j) — the graveyard, or the exile madness put it in instead (rule 702.35a),
 * cast from there before madness's own trigger. Not a card a replacement put on top of
 * the library (Library of Leng), a hidden zone. Malcolm, Alluring Scoundrel.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, counters, hand, lands, life, pickFromZone, spawn, table, toHand, toStep, zone } from "./harness.js";

/** The seat casts the first card it's offered, or declines with `null`; returns what it was offered. */
function castOffered(seat: ScriptedController, decline = false): { offered: string[] } {
  const seen = { offered: [] as string[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.casts.map((c) => c.cardName).join(","));
    if (decline) return null;
    const way = offer.casts.find((c) => c.via === "effect")!;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, free: true };
  };
  return seen;
}

/** Malcolm, with `chorus` counters already, attacks bob; `discard` is the card alice discards. */
function malcolmHits(chorus: number, discardName: string): { game: Game; a: ScriptedController; malcolm: ObjectId; card: ObjectId } {
  const { game, a } = table();
  const malcolm = spawn(game, "Malcolm, Alluring Scoundrel");
  game.state.objects[malcolm].counters = chorus > 0 ? { chorus } : {};
  const card = toHand(game, discardName);
  a.chooseDiscardsFn = () => [card];
  a.declareAttackersFn = () => [{ attacker: malcolm, defender: B }];
  return { game, a, malcolm, card };
}

describe("cast the discarded card (Malcolm, Alluring Scoundrel)", () => {
  it("with a fourth chorus counter, the discarded card is cast from the graveyard for free", () => {
    const { game, a, malcolm, card } = malcolmHits(3, "Divination");
    const seen = castOffered(a);
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
    expect(counters(game, malcolm, "chorus")).toBe(4);
    expect(seen.offered).toEqual(["Divination"]);
    expect(zone(game, card)).toBe("graveyard");
    // Drew one, discarded Divination, then Divination drew two — no land paid for it.
    expect(hand(game).length).toBe(before - 1 + 1 + 2);
  });

  it("under four chorus counters, nothing is offered", () => {
    const { game, a, malcolm, card } = malcolmHits(2, "Divination");
    const seen = castOffered(a);
    toStep(game, "postcombat-main");
    expect(counters(game, malcolm, "chorus")).toBe(3);
    expect(seen.offered).toEqual([]);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("a madness card exiled as it was discarded is cast from exile, before madness's trigger", () => {
    const { game, a, card } = malcolmHits(3, "Kitchen Imp");
    const [swamp] = lands(game, "Swamp", 1);
    const seen = castOffered(a);
    toStep(game, "postcombat-main");
    // One offer, Malcolm's — madness's trigger finds the card gone from exile.
    expect(seen.offered).toEqual(["Kitchen Imp"]);
    expect(zone(game, card)).toBe("battlefield");
    // Free: the Swamp for its madness cost was never tapped.
    expect(game.state.objects[swamp!].tapped).toBeFalsy();
  });

  it("declined, the madness card is still offered by madness's own trigger", () => {
    const { game, a, card } = malcolmHits(3, "Kitchen Imp");
    const [swamp] = lands(game, "Swamp", 1);
    const offered: string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(offer.casts.map((c) => c.cardName).join(","));
      if (offered.length === 1) return null;
      const way = offer.casts.find((c) => c.via === "effect")!;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    toStep(game, "postcombat-main");
    expect(offered).toEqual(["Kitchen Imp", "Kitchen Imp"]);
    expect(zone(game, card)).toBe("battlefield");
    // Paid its madness cost this time.
    expect(game.state.objects[swamp!].tapped).toBe(true);
  });

  it("a land card discarded is never offered", () => {
    const { game, a, card } = malcolmHits(3, "Forest");
    const seen = castOffered(a);
    toStep(game, "postcombat-main");
    expect(seen.offered).toEqual([]);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("a card Library of Leng put on top of the library instead isn't offered", () => {
    const { game, a, card } = malcolmHits(3, "Divination");
    spawn(game, "Library of Leng");
    pickFromZone(a, card);
    const seen = castOffered(a);
    toStep(game, "postcombat-main");
    expect(seen.offered).toEqual([]);
    expect(zone(game, card)).toBe("library");
  });

  it("Malcolm gone as it resolves: no counter, but its last-known four counters still let the card be cast", () => {
    const { game, a, malcolm, card } = malcolmHits(4, "Divination");
    const seen = castOffered(a);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(malcolm, "graveyard");
    toStep(game, "postcombat-main");
    expect(seen.offered).toEqual(["Divination"]);
    expect(zone(game, card)).toBe("graveyard");
    expect(counters(game, malcolm, "chorus")).toBe(0);
  });
});
