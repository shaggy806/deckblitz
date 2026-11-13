import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, settle, spawn, table, toHand, toStep, tokensNamed, zone } from "./harness.js";
import { journalCount } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/**
 * The journal's `"excess-damaged"` word: a permanent dealt excess damage
 * (rule 120.4a), kept as it was dealt it — in the list of whoever controlled
 * it then, read by a filter as it was then — so it answers though the
 * permanent has died since (Rith, Liberated Primeval's ruling).
 */

const DRAGON = "Dragon Token (Dragonback Assault)";

function bolt(game: Game, at: ObjectId, spell = "Lightning Bolt"): void {
  cast(game, toHand(game, spell), { targets: [ref(at)] });
}

function toEndStep(game: Game): void {
  toStep(game, "end");
  settle(game);
}

describe("Rith, Liberated Primeval", () => {
  it("makes a Dragon at your end step after an opponent's creature was dealt excess damage, though it died", () => {
    const { game } = table();
    spawn(game, "Rith, Liberated Primeval");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    bolt(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    toEndStep(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(1);
  });

  it("makes none for damage that was exactly lethal", () => {
    const { game } = table();
    spawn(game, "Rith, Liberated Primeval");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    bolt(game, bears, "Shock");
    expect(zone(game, bears)).toBe("graveyard");
    toEndStep(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(0);
  });

  it("makes none for your own creature's excess damage", () => {
    const { game } = table();
    spawn(game, "Rith, Liberated Primeval");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    bolt(game, bears);
    toEndStep(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(0);
  });

  it("counts an opponent's creature dealt excess damage before it arrived this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    bolt(game, spawn(game, "Grizzly Bears", B));
    spawn(game, "Rith, Liberated Primeval");
    toEndStep(game);
    expect(tokensNamed(game, DRAGON, A)).toBe(1);
  });
});

describe("the excess-damaged journal word", () => {
  it("files the damage under the permanent's controller as it was dealt it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    bolt(game, bears);
    const count = (filter?: { type: "creature" | "planeswalker" }): number =>
      journalCount(game.state, game.registry, [B], "excess-damaged", filter, A);
    expect(count()).toBe(1);
    expect(count({ type: "creature" })).toBe(1);
    expect(count({ type: "planeswalker" })).toBe(0);
    expect(journalCount(game.state, game.registry, [A], "excess-damaged", undefined, A)).toBe(0);
  });
});
