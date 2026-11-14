/**
 * Moving a spell off the stack to another zone, as a cast trigger's "it" or a
 * target: Possibility Storm ("that player exiles it, then exiles cards …
 * until … shares a card type with it"; everything exiled with it to the
 * bottom in a random order), acted on only while it's still that spell on
 * the stack (rule 400.7 — `movedRefAct`).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { A, B, cast, lands, life, nextTurn, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
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
