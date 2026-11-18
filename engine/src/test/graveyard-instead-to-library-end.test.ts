/**
 * Another permanent's "instead" onto a library end, from anywhere — Wheel of
 * Sun and Moon: "if a card would be put into enchanted player's graveyard
 * from anywhere, instead that card is revealed and put on the bottom of that
 * player's library". `ownedBy: "enchanted-player"`, the replacement's
 * `reveal`, a mill that keeps its cards in the library (rule 701.17a: the top
 * cards as it begins), and two or more put there at once arranged by their
 * owner (rule 401.4, the card's first ruling).
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, destroy, graveyard, lands, pickFromZone, ref, settle, spawn, table, toHand, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

const WHEEL = "Wheel of Sun and Moon";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Alice's Wheel of Sun and Moon on `player`. */
function wheelOn(game: Game, player: PlayerId): ObjectId {
  const wheel = spawn(game, WHEEL);
  game.state.objects[wheel].attachedToPlayer = player;
  invalidateComputedCache();
  return wheel;
}

describe("Wheel of Sun and Moon", () => {
  it("is cast on a player", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const wheel = toHand(game, WHEEL);
    cast(game, wheel, { targets: [ref(B)] });
    expect(zone(game, wheel)).toBe("battlefield");
    expect(game.state.objects[wheel].attachedToPlayer).toBe(B);
  });

  it("puts the enchanted player's dying creature on the bottom of their library, revealed", () => {
    const { game } = table();
    wheelOn(game, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const since = game.state.eventLog.length;
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("library");
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(bears);
    expect(game.state.eventLog.slice(since).some((e) => e.type === "cards-revealed" && e.objects.includes(bears))).toBe(true);
  });

  it("leaves another player's cards alone", () => {
    const { game } = table();
    wheelOn(game, B);
    const bears = spawn(game, "Grizzly Bears", A);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("leaves a token to die as tokens do (the ruling)", () => {
    const { game } = table();
    wheelOn(game, B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(0);
    expect(library(game, B).some((id) => game.state.objects[id]?.isToken === true)).toBe(false);
  });

  it("puts a discarded hand on the bottom, its owner arranging it (Mind Rot)", () => {
    const { game, b } = table();
    wheelOn(game, B);
    game.state.zones.perPlayer[B].hand.length = 0;
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    invalidateComputedCache();
    lands(game, "Swamp", 3);
    const rot = toHand(game, "Mind Rot");
    const asked = pickFromZone(b, bears, bolt);
    cast(game, rot, { targets: [ref(B)] });
    expect(asked.offered).toEqual(expect.arrayContaining([bolt, bears]));
    expect(graveyard(game, B)).toEqual([]);
    expect(library(game, B).slice(-2)).toEqual([bears, bolt]);
  });

  it("keeps milled cards in the library, milling no more than it holds, its owner arranging them (Glimpse the Unthinkable)", () => {
    const { game, b } = table();
    wheelOn(game, B);
    game.state.zones.perPlayer[B].library.length = 0;
    const bears = toLibrary(game, "Grizzly Bears", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const giant = toLibrary(game, "Hill Giant", B);
    invalidateComputedCache();
    lands(game, "Underground Sea", 2);
    const glimpse = toHand(game, "Glimpse the Unthinkable");
    const asked = pickFromZone(b, bolt, giant, bears);
    cast(game, glimpse, { targets: [ref(B)] });
    // Ten to mill, three there: each is milled once, onto the bottom.
    expect(asked.offered).toEqual(expect.arrayContaining([bears, bolt, giant]));
    expect(graveyard(game, B)).toEqual([]);
    expect(library(game, B)).toEqual([bolt, giant, bears]);
    expect(game.state.players[B].hasLost).toBe(false);
  });

  it("catches a spell of the enchanted player's as it resolves", () => {
    const { game } = table();
    wheelOn(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(game.state.players[A].life).toBe(17);
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(bolt);
  });
});
