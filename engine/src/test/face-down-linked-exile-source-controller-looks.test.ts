/**
 * A card another player exiles face down from their own hand, linked to a
 * permanent whose controller may look at it (rule 406.3) and so play it
 * (406.3b): `look-and-choose`'s `faceDownLooks: "linked-controller"` —
 * Kheru Mind-Eater's "that player exiles a card from their hand face down.
 * You may look at cards exiled with this creature".
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, attack, destroy, lands, pickFromZone, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Whether `viewer` is shown what's in exile as `card`. */
const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Kheru Mind-Eater: the damaged player's pick, its controller's look", () => {
  it("the damaged player picks from their hand; only the Mind-Eater's controller sees it, and may play it", () => {
    const { game, a, b } = table({ players: 3 });
    const eater = spawn(game, "Kheru Mind-Eater");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears", B);
    const kept = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(b, bears);
    attack(game, a, [eater], B);
    expect(seen.offered).toEqual(expect.arrayContaining([bears, kept]));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, kept)).toBe("hand");
    expect(game.state.objects[bears].exiledWith?.source).toBe(eater);
    expect(sees(game, A, bears)).toBe(true);
    // Face down: not even the player who exiled it may look (406.3).
    expect(sees(game, B, bears)).toBe(false);
    expect(sees(game, C, bears)).toBe(false);
    expect(offers(game, bears)).toHaveLength(1);
    expect(offers(game, bears, B)).toEqual([]);
  });

  it("a player who takes it may look and play too; the first keeps looking, but plays no more", () => {
    const { game, a, b } = table();
    const eater = spawn(game, "Kheru Mind-Eater");
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(b, bears);
    attack(game, a, [eater], B);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(eater)]);
    settle(game);
    expect(sees(game, B, bears)).toBe(true);
    expect(sees(game, A, bears)).toBe(true);
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    expect(offers(game, bears, B)).toHaveLength(1);
  });

  it("once it's gone, the card stays exiled: still seen, no longer playable", () => {
    const { game, a, b } = table();
    const eater = spawn(game, "Kheru Mind-Eater");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(b, bears);
    attack(game, a, [eater], B);
    destroy(game, eater);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(sees(game, A, bears)).toBe(true);
    expect(offers(game, bears)).toEqual([]);
  });
});
