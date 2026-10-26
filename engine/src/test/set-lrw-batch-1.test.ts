/** Lorwyn (batch 189): the lead's clash and champion cards beyond
 * `clash-champion.test.ts`. */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, destroy, enter, hand, keywords, lands, life, pickModes, pickPermanents, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Lorwyn batch 189 (the lead's)", () => {
  it("Weed Strangle gains the destroyed creature's toughness on a win", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B); // 3/3
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Swamp", 5, A);
    cast(game, toHand(game, "Weed Strangle", A), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("Whirlpool Whelm may put the creature on top of its owner's library on a win, and bounces it otherwise", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Island", 4, A);
    a.chooseModesFn = (_view, _min, _max, texts) => [Math.max(0, texts.findIndex((t) => t.startsWith("Put that creature")))];
    cast(game, toHand(game, "Whirlpool Whelm", A), { targets: [ref(giant)] });
    expect(library(game, B)[0]).not.toBe(undefined);
    expect(game.state.objects[library(game, B)[0]].cardName).toBe("Hill Giant");
    const bear = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", A);
    cast(game, toHand(game, "Whirlpool Whelm", A), { targets: [ref(bear)] });
    expect(hand(game, B).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });

  it("Spring Cleaning destroys every enchantment opponents control on a win", () => {
    const { game } = table();
    const target = spawn(game, "Glorious Anthem", B);
    const other = spawn(game, "Glorious Anthem", B);
    const mine = spawn(game, "Glorious Anthem", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Spring Cleaning", A), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Ringskipper returns to its owner's hand when it dies and wins the clash", () => {
    const { game } = table();
    const skipper = spawn(game, "Ringskipper", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    destroy(game, skipper);
    settle(game);
    expect(hand(game, A).some((id) => game.state.objects[id].cardName === "Ringskipper")).toBe(true);
  });

  it("Pollen Lullaby: the opponent clashed with skips untapping their creatures", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Plains", 2, A);
    cast(game, toHand(game, "Pollen Lullaby", A));
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Wren's Run Packmaster's Wolves have deathtouch", () => {
    const { game, a } = table();
    const elf = spawn(game, "Llanowar Elves", A);
    pickModes(a, 0);
    pickPermanents(a, elf);
    const packmaster = enter(game, "Wren's Run Packmaster");
    expect(zone(game, packmaster)).toBe("battlefield");
    lands(game, "Forest", 3, A);
    activate(game, packmaster, 0);
    const wolf = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Wolf Token");
    expect(wolf).toBeDefined();
    expect(keywords(game, wolf as ObjectId).has("deathtouch")).toBe(true);
  });
});
