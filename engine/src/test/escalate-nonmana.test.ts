/**
 * Escalate whose cost isn't mana (rule 702.120a — `castModal.alsoPerExtraMode`):
 * Collective Effort taps an untapped creature for each mode beyond the
 * first, Collective Brutality discards a card. Paid as additional costs are
 * (601.2f–h), so a free cast pays them too (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { tapCountForModes } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, graveyard, hand, lands, life, named, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((o): o is CastOffer => o.kind === "cast-spell" && o.card === card);

describe("Collective Effort — escalate by tapping creatures", () => {
  const board = (creatures: number) => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mine = Array.from({ length: creatures }, () => spawn(game, "Grizzly Bears"));
    const big = spawn(game, "Craw Wurm", B);
    const study = spawn(game, "Rhystic Study", B);
    const card = toHand(game, "Collective Effort");
    return { game, card, mine, big, study };
  };

  it("offers a mode for each creature it can tap beyond the first, the tap counted per extra mode", () => {
    for (const [creatures, most] of [[0, 1], [1, 2], [2, 3], [3, 3]] as const) {
      const { game, card } = board(creatures);
      const [offer] = castOffers(game, card);
      expect(offer?.castModal?.maxModes).toBe(most);
      if (creatures > 0) {
        expect(offer?.tapCost?.perExtraMode).toBe(true);
        expect(tapCountForModes(offer!.tapCost!, [0])).toBe(0);
        expect(tapCountForModes(offer!.tapCost!, [0, 1, 2])).toBe(2);
      }
    }
  });

  it("taps one creature for each mode beyond the first, and does every mode", () => {
    const { game, card, mine, big, study } = board(2);
    cast(game, card, { modes: [0, 1, 2], targets: [ref(big), ref(study), ref(A)], tap: mine });
    expect(mine.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, study)).toBe("graveyard");
    // The tapped creatures still get their counters.
    expect(mine.map((id) => counters(game, id))).toEqual([1, 1]);
  });

  it("taps nothing for one mode", () => {
    const { game, card, mine } = board(2);
    cast(game, card, { modes: [2], targets: [ref(A)] });
    expect(mine.some((id) => game.state.objects[id].tapped)).toBe(false);
    expect(mine.map((id) => counters(game, id))).toEqual([1, 1]);
  });

  it("refuses more modes than it has creatures to tap, or the wrong number tapped", () => {
    const { game, card, mine, big, study } = board(1);
    expect(game.canDispatch({
      type: "cast-spell", player: A, card, modes: [0, 1, 2], targets: [ref(big), ref(study), ref(A)], tap: mine,
    })).toMatch(/untapped|tap/i);
    expect(game.canDispatch({
      type: "cast-spell", player: A, card, modes: [0, 1], targets: [ref(big), ref(study)], tap: [],
    })).toMatch(/tap/i);
  });

  it("picks the creatures itself for a driver that names none", () => {
    const { game, card, mine, big } = board(2);
    cast(game, card, { modes: [0, 2], targets: [ref(big), ref(A)] });
    expect(mine.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
    expect(zone(game, big)).toBe("graveyard");
    expect(pt(game, mine[0]).power).toBe(3);
  });
});

describe("Collective Brutality — escalate by discarding", () => {
  const board = (extraCards: number) => {
    const { game } = table();
    // Alice's hand holds nothing but what's put there below.
    for (const id of [...hand(game)]) game.debugMove(id, "library");
    lands(game, "Swamp", 2);
    const card = toHand(game, "Collective Brutality");
    const fodder = Array.from({ length: extraCards }, () => toHand(game, "Wastes"));
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = spawn(game, "Grizzly Bears", B);
    return { game, card, fodder, bolt, bears };
  };

  it("offers as many modes as it has other cards to discard, plus one", () => {
    for (const [cards, most] of [[0, 1], [1, 2], [2, 3]] as const) {
      const { game, card } = board(cards);
      const [offer] = castOffers(game, card);
      expect(offer?.castModal?.maxModes).toBe(most);
    }
  });

  it("discards a card for each mode beyond the first, and does every mode", () => {
    const { game, card, fodder, bolt, bears } = board(2);
    cast(game, card, { modes: [0, 1, 2], targets: [ref(B), ref(bears), ref(B)] });
    settle(game);
    expect(fodder.every((id) => graveyard(game).includes(id))).toBe(true);
    expect(hand(game)).toHaveLength(0);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(named(game, "Collective Brutality").every((id) => zone(game, id) === "graveyard")).toBe(true);
  });

  it("discards nothing for one mode", () => {
    const { game, card, fodder } = board(2);
    cast(game, card, { modes: [2], targets: [ref(B)] });
    expect(fodder.every((id) => hand(game).includes(id))).toBe(true);
    expect(life(game, B)).toBe(18);
  });

  it("refuses two modes with no other card to discard", () => {
    const { game, card, bears } = board(0);
    expect(game.canDispatch({
      type: "cast-spell", player: A, card, modes: [1, 2], targets: [ref(bears), ref(B)],
    })).toMatch(/hand/i);
  });
});
