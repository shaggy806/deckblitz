/**
 * Worldwake (WWK; B162), the lead's cards: the two features the batch built —
 * a static's `setColors` (layer 5, the Zendikons) and the `{ timesKicked:
 * "source" }` amount (multikicker's "for each time it was kicked").
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  cast,
  destroy,
  hand,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const colorsOf = (game: ReturnType<typeof table>["game"], id: string): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id as never).colors].sort();

describe("Corrupted Zendikon", () => {
  it("makes the land a black 3/3 that Doom Blade can't target, and colourless again once it's gone", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const forest = spawn(game, "Forest");
    cast(game, toHand(game, "Corrupted Zendikon"), { targets: [ref(forest)] });
    expect(colorsOf(game, forest)).toEqual(["B"]);
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
    // "Destroy target nonblack creature": the colour is read through filters.
    expect(() => cast(game, toHand(game, "Doom Blade"), { targets: [ref(forest)] })).toThrow(/target/);
    const [aura] = named(game, "Corrupted Zendikon");
    destroy(game, aura);
    expect(colorsOf(game, forest)).toEqual([]);
  });

  it("returns the land to its owner's hand when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const forest = spawn(game, "Forest");
    cast(game, toHand(game, "Corrupted Zendikon"), { targets: [ref(forest)] });
    destroy(game, forest);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Forest")).toBe(true);
  });
});

describe("Wind Zendikon", () => {
  it("is a blue 2/2 flyer", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const forest = spawn(game, "Forest");
    cast(game, toHand(game, "Wind Zendikon"), { targets: [ref(forest)] });
    expect(colorsOf(game, forest)).toEqual(["U"]);
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Lightkeeper of Emeria", () => {
  it("gains 2 life per kick, and none unkicked", () => {
    const { game } = table();
    lands(game, "Plains", 11);
    cast(game, toHand(game, "Lightkeeper of Emeria"), { kicked: true, kickCount: 3 });
    expect(life(game)).toBe(26);
    cast(game, toHand(game, "Lightkeeper of Emeria"));
    expect(life(game)).toBe(26);
  });
});

describe("Deathforge Shaman", () => {
  it("deals twice the kicks to the target player", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    pickTargets(a, B);
    cast(game, toHand(game, "Deathforge Shaman"), { kicked: true, kickCount: 2 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Wolfbriar Elemental", () => {
  it("makes a Wolf per kick", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Wolfbriar Elemental"), { kicked: true, kickCount: 3 });
    expect(tokensNamed(game, "Wolf Token", A)).toBe(3);
  });
});

describe("Bloodhusk Ritualist", () => {
  it("has the target opponent discard a card per kick", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    pickTargets(a, B);
    cast(game, toHand(game, "Bloodhusk Ritualist"), { kicked: true, kickCount: 2 });
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Spell Contortion", () => {
  it("draws a card per kick as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const opt = toHand(game, "Opt");
    const contortion = toHand(game, "Spell Contortion");
    cast(game, opt, { settle: false });
    const before = hand(game).length;
    // All eight Islands are spent, so the {2} can't be paid: Opt is countered.
    cast(game, contortion, { targets: [ref(opt)], kicked: true, kickCount: 2 });
    expect(zone(game, opt)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});
