/**
 * Krang & Shredder: "whenever Krang & Shredder enter or attack, each
 * opponent exiles cards from the top of their library until they exile a
 * nonland card" — every card exiled **with it** (`reveal-until`'s `linked`
 * inside a `for-each-player`, rule 607.2a), lands too — and "Disappear — At
 * the beginning of your end step, if a permanent left the battlefield under
 * your control this turn, you may cast a card exiled with Krang & Shredder
 * without paying its mana cost". No engine code.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, attack, enter, ref, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";

const KS = "Krang & Shredder";

/** A permanent of `player`'s leaves the battlefield (revolt / disappear). */
function leaveOne(game: Game, player: PlayerId = A): void {
  const ring = spawn(game, "Sol Ring", player);
  game.debugApplyEffect(player, { kind: "return-to-hand", target: 0 }, [ref(ring)]);
  settle(game);
}

/** Record each cast-now offer's cards, casting `pick` when it's offered. */
function castNow(seat: ScriptedController, pick: ObjectId | null): { offered: ObjectId[][] } {
  const seen = { offered: [] as ObjectId[][] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.casts.map((c) => c.card));
    const way = offer.casts.find((c) => c.card === pick);
    if (way === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Krang & Shredder", () => {
  it("entering, each opponent exiles down to a nonland card, every card exiled with it", () => {
    const { game } = table({ players: 3 });
    // Top first: a land, then the Bears for bob; the Giant for carol.
    const bears = toLibrary(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest", B);
    const giant = toLibrary(game, "Hill Giant", C);
    const before = game.state.zones.perPlayer[B].library.length;
    const ks = enter(game, KS);
    for (const card of [forest, bears, giant]) {
      expect(zone(game, card)).toBe("exile");
      expect(game.state.objects[card].exiledWith?.source).toBe(ks);
    }
    // The Wastes below stay put.
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 2);
  });

  it("attacking, it exiles again", () => {
    const { game, a } = table();
    const ks = spawn(game, KS);
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [ks]);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].exiledWith?.source).toBe(ks);
  });

  it("disappear casts one card exiled with it, free, only if a permanent left", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    enter(game, KS);
    const seen = castNow(a, bears);
    // No permanent left: the ability doesn't trigger (its intervening if).
    toStep(game, "end");
    settle(game);
    expect(seen.offered).toEqual([]);
    expect(zone(game, bears)).toBe("exile");
  });

  it("…and with one gone, the creature card is cast — the land never offered", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest", B);
    enter(game, KS);
    const seen = castNow(a, bears);
    leaveOne(game);
    toStep(game, "end");
    settle(game);
    expect(seen.offered).toEqual([[bears]]);
    expect(seen.offered[0]).not.toContain(forest);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});
