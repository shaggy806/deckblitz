/**
 * Rule 205.3d: an object can't have a subtype that goes with none of its
 * card types. An effect that made a creature an Angel for good gives a
 * permanent that's stopped being a creature nothing, until it's a creature
 * again (Archangel Elspeth's ruling).
 */
import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards.js";
import { subtypeFitsTypes } from "../subtypes.js";
import {
  A,
  activate,
  counters,
  keywords,
  lands,
  loyalty,
  named,
  nextTurn,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("a subtype that goes with no card type the object has (rule 205.3d)", () => {
  it("every pool card's printed subtypes go with its printed types", () => {
    const misfits = POOL_CARDS.flatMap((card) =>
      (card.subtypes ?? []).filter((s) => !subtypeFitsTypes(s, card.types)).map((s) => `${card.name}: ${s}`),
    );
    expect(misfits).toEqual([]);
  });

  it("an Angel for good stops being one while it isn't a creature, and is one again when it is", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const village = spawn(game, "Treetop Village");
    const elspeth = spawn(game, "Archangel Elspeth");
    activate(game, village, 1);
    expect(types(game, village)).toContain("creature");
    loyalty(game, elspeth, -2, { targets: [ref(village)] });
    expect(counters(game, village)).toBe(2);
    expect(subtypes(game, village)).toEqual(expect.arrayContaining(["Ape", "Angel"]));
    expect(keywords(game, village).has("flying")).toBe(true);
    expect(pt(game, village)).toEqual({ power: 5, toughness: 5 });

    // The animation ends: a land with no creature type. The effect has no
    // duration, so flying (which says nothing while it isn't a creature) stays.
    nextTurn(game);
    expect(types(game, village)).toEqual(["land"]);
    expect(subtypes(game, village)).toEqual([]);
    expect(keywords(game, village).has("flying")).toBe(true);

    // A creature again: an Angel again, beside the Ape the later effect adds.
    toStep(game, "precombat-main");
    activate(game, village, 1);
    expect(subtypes(game, village)).toEqual(expect.arrayContaining(["Ape", "Angel"]));
  });

  it("Archangel Elspeth: +1 makes a lifelink Soldier, −6 returns the small nonland permanents", () => {
    const { game } = table();
    const elspeth = spawn(game, "Archangel Elspeth");
    loyalty(game, elspeth, 1);
    expect(tokensNamed(game, "Lifelink Soldier Token", A)).toBe(1);
    expect(keywords(game, named(game, "Lifelink Soldier Token", A)[0]).has("lifelink")).toBe(true);

    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const forest = toGraveyard(game, "Forest");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const big = toGraveyard(game, "Serra Angel");
    toStep(game, "precombat-main");
    loyalty(game, elspeth, -6, { atLeast: 6 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, big)).toBe("graveyard");
  });
});
