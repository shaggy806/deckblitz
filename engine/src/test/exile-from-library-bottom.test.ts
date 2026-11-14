/**
 * Exiling from the **bottom** of a library: `exile-from-library`'s and
 * `impulse-exile`'s `fromBottom` — Arvinox, the Mind Flail's "exile the
 * bottom card of each opponent's library face down … you may cast permanent
 * spells from among them" and The Temporal Anchor's "exile that many cards
 * from the bottom of your library", linked to it for "you may play cards
 * exiled with The Temporal Anchor".
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, cast, lands, settle, spawn, table, toLibrary, toStep, types, zone } from "./harness.js";

/** A card put at the bottom of `player`'s library. */
const toBottom = (game: Game, name: string, player: PlayerId): ObjectId => {
  const id = toLibrary(game, name, player);
  const library = game.state.zones.perPlayer[player].library;
  library.splice(library.indexOf(id), 1);
  library.push(id);
  invalidateComputedCache();
  return id;
};

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((o) => o.kind === "cast-spell" && o.card === card);
const canPlayLand = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((o) => o.kind === "play-land" && o.card === card);

describe("exile from the bottom of a library", () => {
  it("exile-from-library fromBottom takes the bottom N, not the top", () => {
    const { game } = table();
    const bottom = toBottom(game, "Forest", B);
    const top = toLibrary(game, "Island", B);
    game.debugApplyEffect(A, { kind: "exile-from-library", whose: "each-opponent", amount: 1, fromBottom: true });
    expect(zone(game, bottom)).toBe("exile");
    expect(zone(game, top)).toBe("library");
  });

  it("Arvinox exiles the bottom card of each opponent's library face down at your end step", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Arvinox, the Mind Flail");
    const bears = toBottom(game, "Grizzly Bears", B);
    const carols = toBottom(game, "Forest", C);
    const top = toLibrary(game, "Island", B);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    expect(zone(game, top)).toBe("library");
    // Face down: only Arvinox's controller may look (rule 406.3).
    expect(game.state.objects[bears].exiledFaceDown?.lookers).toEqual([A]);
  });

  it("Arvinox's cards: permanent spells only, any colour of mana, on later turns too", () => {
    const { game } = table();
    spawn(game, "Arvinox, the Mind Flail");
    const bears = toBottom(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    const bolt = toBottom(game, "Lightning Bolt", B);
    // Next turn: bears castable with black mana; an instant would not be.
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "end" && s.priority.holder === B);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.turn.step === "precombat-main" && s.priority.holder === A);
    lands(game, "Swamp", 2);
    expect(canCast(game, bears)).toBe(true);
    expect(canCast(game, bears, B)).toBe(false);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // The Bolt went the following end step; a non-permanent isn't castable.
    toStep(game, "end");
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    lands(game, "Mountain", 1);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(canCast(game, bolt)).toBe(false);
  });

  it("Arvinox isn't a creature until you control three permanents you don't own", () => {
    const { game } = table();
    const arvinox = spawn(game, "Arvinox, the Mind Flail");
    expect(types(game, arvinox)).not.toContain("creature");
    const stolen = [spawn(game, "Grizzly Bears", B), spawn(game, "Forest", B)];
    for (const id of stolen) game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: id }]);
    expect(types(game, arvinox)).not.toContain("creature");
    const third = spawn(game, "Island", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: third }]);
    expect(types(game, arvinox)).toContain("creature");
    expect(types(game, arvinox)).toContain("enchantment");
  });

  it("The Temporal Anchor exiles as many from the bottom as the scry bottomed, playable on your turn", () => {
    const { game, a } = table();
    spawn(game, "The Temporal Anchor");
    const forest = toBottom(game, "Forest", A);
    const giant = toBottom(game, "Hill Giant", A);
    const shock = toLibrary(game, "Shock", A);
    const island = toLibrary(game, "Island", A);
    // Scry 2, the Island to the bottom: one card is exiled from there — the
    // Island, now under the Forest and the Hill Giant.
    a.chooseScryFn = (_view, cards) => cards.slice(0, 1);
    game.debugApplyEffect(A, { kind: "scry", amount: 2 });
    settle(game);
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, forest)).toBe("library");
    expect(zone(game, shock)).toBe("library");
    expect(game.state.objects[island].exiledWith).toBeDefined();
    expect(canPlayLand(game, island)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: island });
    expect(zone(game, island)).toBe("battlefield");
  });

  it("The Temporal Anchor's cards can't be cast on an opponent's turn", () => {
    const { game, a } = table();
    spawn(game, "The Temporal Anchor");
    lands(game, "Mountain", 1);
    const shock = toLibrary(game, "Shock", A);
    toLibrary(game, "Island", A);
    a.chooseScryFn = (_view, cards) => cards;
    game.debugApplyEffect(A, { kind: "scry", amount: 2 });
    settle(game);
    expect(zone(game, shock)).toBe("exile");
    expect(canCast(game, shock)).toBe(true);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(canCast(game, shock)).toBe(false);
  });
});
