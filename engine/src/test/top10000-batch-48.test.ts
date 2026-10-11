/**
 * Card batch 48 (2026-10-11): the cards random choice unblocked — a card at
 * random from a graveyard (`choose-random-card`), a mode at random (`modal`'s
 * `random`). Exalted Flamer of Tzeentch, Deadbridge Chant and Crystalline
 * Giant are in `random-choice.test.ts`. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  cast,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** Answer every cast-now offer by casting the first copy on offer, up to
 * `times` of them; what was offered and cast. */
function castCopies(seat: ScriptedController, times: number): { offered: number; cast: ObjectId[] } {
  const seen = { offered: 0, cast: [] as ObjectId[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered += 1;
    if (seen.cast.length >= times || offer.casts.length === 0) return null;
    const way = offer.casts[0];
    seen.cast.push(way.card);
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Gamble", () => {
  it("puts the found card into your hand, then discards one card at random from it, without asking", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    const before = [...hand(game)];
    pickFromZone(a, bears);
    cast(game, toHand(game, "Gamble"));
    // One of the hand as it stood with the find in it went; the rest stayed.
    const discarded = [...before, bears].filter((id) => zone(game, id) === "graveyard");
    expect(discarded).toHaveLength(1);
    expect(hand(game)).toHaveLength(before.length);
    expect(zone(game, bears) === "hand" || discarded[0] === bears).toBe(true);
  });

  it("can discard the very card it found", () => {
    const found = new Set<boolean>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game, a } = table({ seed });
      lands(game, "Mountain", 1);
      const bears = toLibrary(game, "Grizzly Bears");
      pickFromZone(a, bears);
      cast(game, toHand(game, "Gamble"));
      found.add(zone(game, bears) === "graveyard");
    }
    expect(found).toEqual(new Set([true, false]));
  });
});

/** Activate `source`'s first ability, sacrificing `victim` for its cost. */
function sacrificing(game: Game, source: ObjectId, victim: ObjectId): void {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], sacrifice: victim };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("Tomb Tyrant", () => {
  it("gives other Zombies +1/+1", () => {
    const { game } = table();
    const tyrant = spawn(game, "Tomb Tyrant");
    const zombie = spawn(game, "Walking Corpse");
    expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, tyrant)).toEqual({ power: 3, toughness: 3 });
  });

  it("needs three Zombie creature cards in the graveyard before it's activated — a sacrificed Zombie doesn't make the third", () => {
    const { game } = table();
    const tyrant = spawn(game, "Tomb Tyrant");
    lands(game, "Swamp", 3);
    const fodder = spawn(game, "Walking Corpse");
    toGraveyard(game, "Walking Corpse");
    toGraveyard(game, "Walking Corpse");
    expect(() => sacrificing(game, tyrant, fodder)).toThrow(/condition|only/i);
    expect(zone(game, fodder)).toBe("battlefield");
    // With a third there already, it can be.
    toGraveyard(game, "Walking Corpse");
    sacrificing(game, tyrant, fodder);
    expect(zone(game, fodder)).toBe("graveyard");
  });

  it("returns a Zombie creature card at random, never another card", () => {
    const { game } = table();
    const tyrant = spawn(game, "Tomb Tyrant");
    lands(game, "Swamp", 3);
    const fodder = spawn(game, "Grizzly Bears");
    const zombies = [0, 1, 2].map(() => toGraveyard(game, "Walking Corpse"));
    const bolt = toGraveyard(game, "Lightning Bolt");
    sacrificing(game, tyrant, fodder);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zombies.filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("can't be activated on an opponent's turn", () => {
    const { game } = table();
    const tyrant = spawn(game, "Tomb Tyrant");
    lands(game, "Swamp", 3);
    const fodder = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Walking Corpse");
    game.advanceUntil((s) => s.turnOrder[s.turn.activePlayerIndex] !== A && s.priority.holder === A);
    expect(() => sacrificing(game, tyrant, fodder)).toThrow(/condition|only/i);
  });
});

describe("Wondrous Crucible", () => {
  it("mills two, exiles a nonland card at random and casts a copy of it for free", () => {
    const { game, a } = table();
    spawn(game, "Wondrous Crucible");
    const divination = toGraveyard(game, "Divination");
    toGraveyard(game, "Forest");
    const seen = castCopies(a, 1);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(zone(game, divination)).toBe("exile");
    expect(seen.cast).toHaveLength(1);
    expect(seen.cast[0]).not.toBe(divination);
    expect(hand(game).length).toBe(before + 2);
    // The two milled cards (the deck's Wastes) and the Forest stay put.
    expect(graveyard(game)).toHaveLength(3);
  });

  it("copies a permanent card as a token", () => {
    const { game, a } = table();
    spawn(game, "Wondrous Crucible");
    const bears = toGraveyard(game, "Grizzly Bears");
    castCopies(a, 1);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    const token = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Grizzly Bears",
    );
    expect(token).toBeDefined();
    expect(game.state.objects[token as ObjectId].isToken).toBe(true);
  });
});

describe("Arcane Bombardment", () => {
  it("exiles an instant or sorcery at random on your first one each turn and casts copies of everything it holds", () => {
    const { game, a } = table();
    spawn(game, "Arcane Bombardment");
    lands(game, "Island", 6);
    const stored = toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    const seen = castCopies(a, 5);
    const before = hand(game).length;
    cast(game, toHand(game, "Divination"));
    expect(zone(game, stored)).toBe("exile");
    expect(seen.cast).toHaveLength(1);
    // The copy's two cards and the spell's own two.
    expect(hand(game).length).toBe(before + 4);
    // A second instant or sorcery this turn doesn't trigger it.
    cast(game, toHand(game, "Divination"));
    expect(seen.cast).toHaveLength(1);
  });
});
