/**
 * Moving a spell off the stack to another zone, as a cast trigger's "it" or a
 * target: Possibility Storm ("that player exiles it, then exiles cards …
 * until … shares a card type with it"; everything exiled with it to the
 * bottom in a random order), acted on only while it's still that spell on
 * the stack (rule 400.7 — `movedRefAct`).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { A, B, cast, enter, lands, life, named, nextTurn, pickModes, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import { lastRollIn } from "../random-results.js";
import type { ObjectId } from "../primitives.js";

const castFree = (seat: ScriptedController, targets: readonly ReturnType<typeof ref>[] = [ref(B)]): void => {
  seat.chooseCastNowFn = (_v, offer) => {
    const way = offer.casts[0];
    return way === undefined ? null : { type: "cast-spell", player: seat.playerId, card: way.card, targets: [...targets], via: way.via, free: true };
  };
};

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Possibility Storm", () => {
  it("exiles the spell, exiles until a card sharing a type, casts it free, and buries the rest at random", () => {
    const { game, a } = table();
    const storm = spawn(game, "Possibility Storm");
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    castFree(a);
    cast(game, shock, { targets: [ref(B)] });
    // Shock never resolved; the Bolt it found did.
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, shock)).toBe("library");
    expect(zone(game, bears)).toBe("library");
    const lib = library(game);
    expect(new Set(lib.slice(-2))).toEqual(new Set([shock, bears]));
    expect(game.state.objects[storm].zone).toBe("battlefield");
  });

  it("buries the card found too when it isn't cast", () => {
    const { game } = table();
    spawn(game, "Possibility Storm");
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(new Set(library(game).slice(-3))).toEqual(new Set([shock, bears, bolt]));
  });

  it("works on any player's spell from their hand, in their own library", () => {
    const { game, b } = table();
    spawn(game, "Possibility Storm");
    lands(game, "Forest", 2, B);
    nextTurn(game);
    const theirBears = toLibrary(game, "Grizzly Bears", B);
    const theirBolt = toLibrary(game, "Lightning Bolt", B);
    const cub = toHand(game, "Grizzly Bears", B);
    castFree(b, []);
    cast(game, cub, { player: B });
    // An instant isn't a creature: exiled and passed over, the Bears found and cast.
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(new Set(library(game, B).slice(-2))).toEqual(new Set([cub, theirBolt]));
  });

  it("with the spell already gone, still exiles until a card sharing a type with it (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Possibility Storm");
    spawn(game, "Possibility Storm");
    lands(game, "Mountain", 2);
    const second = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    castFree(a);
    cast(game, shock, { targets: [ref(B)] });
    // The first trigger exiled Shock; the second found it gone and still cast a Bolt.
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
    expect(zone(game, shock)).toBe("library");
  });
});

/** Answer the next "you may cast" with `card` (or decline), recording what was offered. */
const castPick = (seat: ScriptedController, card: ObjectId | null, targets: readonly ReturnType<typeof ref>[] = [ref(B)]): { offered: ObjectId[] } => {
  const seen = { offered: [] as ObjectId[] };
  seat.chooseCastNowFn = (_v, offer) => {
    seen.offered = offer.casts.map((c) => c.card);
    const way = offer.casts.find((c) => c.card === card);
    return way === undefined ? null : { type: "cast-spell", player: seat.playerId, card: way.card, targets: [...targets], via: way.via, free: true };
  };
  return seen;
};

describe("Knowledge Pool", () => {
  it("exiles each player's top three with it, then trades a spell cast from hand for another card exiled with it", () => {
    const { game, a, b } = table();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B);
    const theirBolt = toLibrary(game, "Lightning Bolt", B);
    const pool = enter(game, "Knowledge Pool");
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].exiledWith?.source === pool);
    expect(exiled).toHaveLength(6);
    expect(zone(game, theirBolt)).toBe("exile");

    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const seen = castPick(a, theirBolt);
    cast(game, shock, { targets: [ref(B)] });
    // Shock, just exiled, isn't offered; lands never are.
    expect(seen.offered).toContain(theirBolt);
    expect(seen.offered).not.toContain(shock);
    expect(seen.offered.every((id) => game.state.objects[id].cardName !== "Wastes")).toBe(true);
    expect(life(game, B)).toBe(17);
    expect(zone(game, theirBolt)).toBe("graveyard");
    expect(game.state.objects[theirBolt].owner).toBe(B);
    expect(zone(game, shock)).toBe("exile");
    expect(game.state.objects[shock].exiledWith?.source).toBe(pool);

    // The next player's spell from hand can trade for Shock.
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const bears = toHand(game, "Grizzly Bears", B);
    castPick(b, shock, [ref(A)]);
    cast(game, bears, { player: B });
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("exile");
  });

  it("still exiles the spell with nothing to cast", () => {
    const { game } = table();
    enter(game, "Knowledge Pool");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, shock)).toBe("exile");
  });
});

describe("Neera, Wild Mage", () => {
  it("puts the spell on the bottom, reveals until a nonland card, casts it free and buries the rest", () => {
    const { game, a } = table();
    spawn(game, "Neera, Wild Mage");
    lands(game, "Mountain", 4);
    const bolt = toLibrary(game, "Lightning Bolt");
    const mountain = toLibrary(game, "Mountain");
    const shock = toHand(game, "Shock");
    pickModes(a, 0);
    castFree(a);
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
    // Shock first, then the revealed Mountain under it.
    expect(library(game).slice(-2)).toEqual([shock, mountain]);

    // Only once each turn.
    const second = toHand(game, "Shock");
    cast(game, second, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("declined, or with the spell countered in response, does nothing", () => {
    const { game, a } = table();
    spawn(game, "Neera, Wild Mage");
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    pickModes(a, 0);
    castFree(a);
    cast(game, shock, { targets: [ref(B)], settle: false });
    // Countered before Neera's ability resolves: it's in the graveyard, a new
    // object (rule 400.7), and isn't put on the bottom — so nothing is revealed.
    cast(game, toHand(game, "Counterspell"), { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("library");
    expect(library(game)[0]).toBe(bolt);
    expect(life(game, B)).toBe(20);

    nextTurn(game);
    nextTurn(game);
    const third = toHand(game, "Shock");
    pickModes(a);
    cast(game, third, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, third)).toBe("graveyard");
  });
});

describe("Gale's Redirection", () => {
  /** The first seed whose roll lands in [min, max], with Blaze (X = 4, mana value 5) exiled. */
  function redirected(min: number, max: number) {
    for (let seed = 1; seed < 200; seed += 1) {
      const t = table({ seed });
      lands(t.game, "Mountain", 5);
      lands(t.game, "Island", 5);
      const blaze = toHand(t.game, "Blaze");
      cast(t.game, blaze, { x: 4, targets: [ref(B)], settle: false });
      cast(t.game, toHand(t.game, "Gale's Redirection"), { targets: [ref(blaze)] });
      const roll = lastRollIn(t.game.state)!;
      if (roll.total >= min && roll.total <= max) return { ...t, blaze, roll };
    }
    throw new Error("no seed rolled it");
  }

  it("exiles the spell without countering it and adds its mana value, {X} included, to the d20", () => {
    const { game, blaze, roll } = redirected(1, 99);
    expect(zone(game, blaze)).toBe("exile");
    expect(life(game, B)).toBe(20);
    expect(roll.total - roll.results[0]).toBe(5);
  });

  it("1—14: castable while exiled, its mana spent as though any color", () => {
    const { game, blaze } = redirected(1, 14);
    expect(game.state.objects[blaze].playPermission?.player).toBe(A);
    nextTurn(game);
    nextTurn(game);
    // Islands alone pay {X}{R}.
    for (const id of named(game, "Mountain", A)) game.debugMove(id, "graveyard");
    expect(named(game, "Island", A)).toHaveLength(5);
    cast(game, blaze, { x: 1, targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(19);
  });

  it("15+: castable while exiled without paying its mana cost", () => {
    const { game, blaze } = redirected(15, 99);
    nextTurn(game);
    nextTurn(game);
    cast(game, blaze, { x: 0, targets: [ref(B)], via: "impulse", free: true });
    expect(zone(game, blaze)).toBe("graveyard");
  });
});
