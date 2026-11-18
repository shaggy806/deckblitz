/**
 * The colours among the exiled cards used to craft a permanent (rule
 * 702.167c): a `distinct` aggregate `of: "color"` over `"exiled-with-source"`
 * (each colour once, however many have it; colourless none, rule 105.2c), and
 * `add-mana`'s `eachColorAmong` with `zone: "exiled-with-source"` — Sunbird
 * Effigy's "power and toughness are each equal to the number of colors among
 * the exiled cards used to craft it" and "{T}: For each color among the
 * exiled cards used to craft this creature, add one mana of that color".
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import { A, activate, keywords, lands, pickFromZone, pt, spawn, table, toGraveyard, zone } from "./harness.js";

/** Sunbird Standard crafted with `materials` from alice's graveyard. */
function crafted(game: Game, a: ScriptedController, ...materials: readonly string[]): { effigy: ObjectId; cards: ObjectId[] } {
  lands(game, "Wastes", 5);
  const standard = spawn(game, "Sunbird Standard");
  const cards = materials.map((name) => toGraveyard(game, name));
  pickFromZone(a, ...cards);
  activate(game, standard, 1);
  expect(printedCardName(game.state.objects[standard])).toBe("Sunbird Effigy");
  for (const card of cards) expect(zone(game, card)).toBe("exile");
  return { effigy: standard, cards };
}

const pool = (game: Game) => poolCounts(game.state.players[A].manaPool);

describe("Sunbird Standard // Sunbird Effigy", () => {
  it("the front face taps for one mana of any color", () => {
    const { game } = table();
    const standard = spawn(game, "Sunbird Standard");
    game.dispatch({ type: "activate-ability", player: A, source: standard, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(pool(game)).toMatchObject({ U: 1 });
  });

  it("is as big as the colors among its materials, each once, colorless none", () => {
    const { game, a } = table();
    const { effigy } = crafted(game, a, "Grizzly Bears", "Llanowar Elves", "Lightning Helix", "Sol Ring");
    // Green (twice), red and white: three colors.
    expect(pt(game, effigy)).toEqual({ power: 3, toughness: 3 });
    expect([...keywords(game, effigy)]).toEqual(expect.arrayContaining(["flying", "vigilance", "haste"]));
  });

  it("taps (haste) for one mana of each of those colors", () => {
    const { game, a } = table();
    const { effigy } = crafted(game, a, "Grizzly Bears", "Llanowar Elves", "Lightning Helix", "Sol Ring");
    activate(game, effigy, 0);
    expect(pool(game)).toEqual({ W: 1, U: 0, B: 0, R: 1, G: 1, C: 0 });
  });

  it("only the cards still exiled count", () => {
    const { game, a } = table();
    const { effigy, cards } = crafted(game, a, "Grizzly Bears", "Lightning Helix");
    expect(pt(game, effigy)).toEqual({ power: 3, toughness: 3 });
    game.debugMove(cards[1], "graveyard");
    expect(pt(game, effigy)).toEqual({ power: 1, toughness: 1 });
    activate(game, effigy, 0);
    expect(pool(game)).toEqual({ W: 0, U: 0, B: 0, R: 0, G: 1, C: 0 });
  });

  it("crafted from colorless materials alone, it's 0/0 and dies", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    const standard = spawn(game, "Sunbird Standard");
    pickFromZone(a, toGraveyard(game, "Sol Ring"));
    activate(game, standard, 1);
    expect(zone(game, standard)).toBe("graveyard");
  });
});
