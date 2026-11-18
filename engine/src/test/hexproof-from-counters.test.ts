/**
 * Keyword counters of a keyword's variants (rule 122.1b): a "hexproof from
 * [quality]" counter gives that hexproof ability (702.11d), gone with a loss
 * of hexproof (702.11e). Kathril, Aspect Warper puts one counter of each
 * listed keyword a creature card in your graveyard has — one however many
 * have it — on a creature you control chosen for each, every "hexproof from"
 * ability among them a counter of its own variant kind (its ruling), then a
 * +1/+1 counter on itself for each counter put on this way.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics, hexproofFromCounterKinds, hexproofFromOfCounter } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { counters, enter, keywords, pickPermanents, pt, registryOf, spawn, table, toGraveyard } from "./harness.js";

const hexColors = (game: Game, id: ObjectId) => [...computeCharacteristics(game.state, registryOf(game), id).hexproofFrom.colors].sort();

describe("hexproof-from counters", () => {
  it("name a variant as the ability does, and read back to it", () => {
    expect(hexproofFromCounterKinds({ colors: ["W", "U", "B", "R", "G"] }, [])).toEqual([
      "hexproof from white",
      "hexproof from blue",
      "hexproof from black",
      "hexproof from red",
      "hexproof from green",
    ]);
    expect(hexproofFromCounterKinds({ types: ["artifact", "creature", "enchantment"] }, [])).toEqual([
      "hexproof from artifacts, creatures, and enchantments",
    ]);
    expect(hexproofFromCounterKinds({ filter: { colorless: false, multicolored: false } }, [])).toEqual(["hexproof from monocolored"]);
    expect(hexproofFromCounterKinds({ ownColors: true }, ["R"])).toEqual(["hexproof from red"]);
    // Not the keyword: no counter.
    expect(hexproofFromCounterKinds({ colors: ["W"], spellsOnly: true, notHexproof: true }, [])).toEqual([]);
    expect(hexproofFromOfCounter("hexproof from white")).toEqual({ colors: ["W"] });
    expect(hexproofFromOfCounter("hexproof from artifacts, creatures, and enchantments")).toEqual({
      types: ["artifact", "creature", "enchantment"],
    });
    expect(hexproofFromOfCounter("hexproof from monocolored")).toEqual({ filter: { multicolored: false, colorless: false } });
    expect(hexproofFromOfCounter("hexproof from planeswalkers")).toEqual({ types: ["planeswalker"] });
    expect(hexproofFromOfCounter("flying")).toBeNull();
  });

  it("give a permanent that hexproof ability", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["hexproof from black"] = 1;
    expect(hexColors(game, bears)).toEqual(["B"]);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });
});

describe("Kathril, Aspect Warper", () => {
  it("puts one counter of each keyword your graveyard's creature cards have, variants their own kind", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Wind Drake");
    toGraveyard(game, "Storm Crow");
    toGraveyard(game, "Knight of Malice");
    toGraveyard(game, "Giant Spider");
    pickPermanents(a, bears);
    const kathril = enter(game, "Kathril, Aspect Warper");
    // Flying once for two flyers, first strike, hexproof from white, reach.
    expect(counters(game, bears, "flying")).toBe(1);
    expect(counters(game, bears, "first-strike")).toBe(1);
    expect(counters(game, bears, "hexproof from white")).toBe(1);
    expect(counters(game, bears, "reach")).toBe(1);
    expect(counters(game, bears, "hexproof")).toBe(0);
    const has = keywords(game, bears);
    expect(["flying", "first-strike", "reach"].every((k) => has.has(k))).toBe(true);
    expect(has.has("hexproof")).toBe(false);
    expect(hexColors(game, bears)).toEqual(["W"]);
    expect(counters(game, kathril, "+1/+1")).toBe(4);
    expect(pt(game, kathril)).toEqual({ power: 7, toughness: 7 });
  });

  it("puts a plain hexproof counter and one of each hexproof-from variant (the ruling)", () => {
    const { game, a } = table();
    toGraveyard(game, "Gladecover Scout");
    toGraveyard(game, "Knight of Malice");
    toGraveyard(game, "Knight of Grace");
    let kathril: ObjectId | undefined;
    a.choosePermanentsFn = (_view, eligible) => [kathril ?? eligible[0]];
    kathril = enter(game, "Kathril, Aspect Warper", undefined, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, kathril, "hexproof")).toBe(1);
    expect(counters(game, kathril, "hexproof from white")).toBe(1);
    expect(counters(game, kathril, "hexproof from black")).toBe(1);
    expect(counters(game, kathril, "first-strike")).toBe(1);
    expect(counters(game, kathril, "+1/+1")).toBe(4);
    expect(hexColors(game, kathril)).toEqual(["B", "W"]);
  });

  it("puts nothing on with no creature card in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    const kathril = enter(game, "Kathril, Aspect Warper");
    expect(Object.values(game.state.objects[kathril].counters).filter((n) => (n ?? 0) > 0)).toEqual([]);
    expect(pt(game, kathril)).toEqual({ power: 3, toughness: 3 });
  });
});
