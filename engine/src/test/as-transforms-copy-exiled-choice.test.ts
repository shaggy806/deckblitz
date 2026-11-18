/**
 * "{X}{U}{U}{B}{B}, Exile X creature cards from your graveyard: Transform
 * Ludevic." and Olag, Ludevic's Hubris's "As this creature transforms into
 * Olag, it becomes a copy of a creature card exiled with it, except its name
 * is Olag, Ludevic's Hubris, it's 4/4, and it's a legendary blue and black
 * Zombie in addition to its other colors and types. Put a number of +1/+1
 * counters on Olag equal to the number of creature cards exiled with it."
 * (Ludevic, Necrogenius): the cost's `exileFromGraveyard.linked` (rule
 * 607.2a, 607.1b), and `CardDefinition.copyOnTransform` — the card chosen as
 * it transforms (rule 712.20), a `choose-modes` of the `transform` effect
 * among different names. Need key replacement:as-transforms-copy-exiled-choice.
 */

import { describe, expect, it } from "vitest";

import { A, activate, attack, counters, enter, keywords, lands, pt, settle, spawn, subtypes, supertypes, table, toGraveyard, zone } from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

const name = (game: Game, id: ObjectId): string => nameOf(game.state.objects[id]);

/** Ludevic with mana for X = `x` and creature cards `cards` in alice's graveyard. */
function ludevic(game: Game, x: number, cards: readonly string[]): { ludevic: ObjectId; cards: ObjectId[] } {
  lands(game, "Island", 2 + Math.ceil(x / 2));
  lands(game, "Swamp", 2 + Math.floor(x / 2));
  const id = spawn(game, "Ludevic, Necrogenius");
  return { ludevic: id, cards: cards.map((card) => toGraveyard(game, card)) };
}

describe("Ludevic, Necrogenius", () => {
  it("transforms into a copy of the creature card chosen among those exiled with it, with a counter for each", () => {
    const { game, a } = table();
    const { ludevic: id, cards } = ludevic(game, 2, ["Hill Giant", "Serra Angel"]);
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts ?? [];
      return [offered.indexOf("Copy Serra Angel")];
    };
    activate(game, id, 0, { x: 2 });
    for (const card of cards) {
      expect(zone(game, card)).toBe("exile");
      expect(game.state.objects[card].exiledWith?.source).toBe(id);
    }
    expect(offered).toEqual(expect.arrayContaining(["Copy Hill Giant", "Copy Serra Angel"]));
    expect(name(game, id)).toBe("Olag, Ludevic's Hubris");
    // 4/4, and two +1/+1 counters.
    expect(counters(game, id)).toBe(2);
    expect(pt(game, id)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, id).has("flying")).toBe(true);
    expect(keywords(game, id).has("vigilance")).toBe(true);
    expect(supertypes(game, id)).toContain("legendary");
    expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Angel", "Zombie"]));
    expect([...computeCharacteristics(game.state, game.registry, id).colors].sort()).toEqual(["B", "U", "W"]);
  });

  it("asks nothing with one card to copy, and stays a copy once that card leaves exile", () => {
    const { game, a } = table();
    const { ludevic: id, cards } = ludevic(game, 1, ["Hill Giant"]);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    activate(game, id, 0, { x: 1 });
    expect(asked).toBe(0);
    expect(name(game, id)).toBe("Olag, Ludevic's Hubris");
    expect(counters(game, id)).toBe(1);
    expect(pt(game, id)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Giant", "Zombie"]));
    game.debugMove(cards[0], "graveyard");
    settle(game);
    expect(subtypes(game, id)).toContain("Giant");
  });

  it("is its 4/4 self with no counters when the exiled cards are gone as it transforms", () => {
    const { game } = table();
    const { ludevic: id, cards } = ludevic(game, 1, ["Hill Giant"]);
    activate(game, id, 0, { x: 1, settle: false });
    expect(zone(game, cards[0])).toBe("exile");
    game.debugMove(cards[0], "graveyard");
    settle(game);
    expect(name(game, id)).toBe("Olag, Ludevic's Hubris");
    expect(counters(game, id)).toBe(0);
    expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, id)).toEqual(["Zombie"]);
  });

  it("can't be activated with X = 0", () => {
    const { game } = table();
    const { ludevic: id } = ludevic(game, 0, ["Hill Giant"]);
    expect(() => activate(game, id, 0, { x: 0 })).toThrow();
    expect(game.state.objects[id].face ?? 0).toBe(0);
  });

  it("mills a card as it enters and as it attacks", () => {
    const { game, a } = table();
    const library = (): number => game.state.zones.perPlayer[A].library.length;
    const before = library();
    const id = enter(game, "Ludevic, Necrogenius");
    expect(library()).toBe(before - 1);
    attack(game, a, [id]);
    expect(library()).toBe(before - 2);
  });
});
