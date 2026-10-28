/**
 * Cards freed by `grant-protection` (rule 702.16), group A: the clauses most
 * likely to be wrong — a colour remembered past a sacrifice, conditions per
 * colour, a threshold rider, who a filter reaches.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  lands,
  life,
  pickModes,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const protectedFrom = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors].sort();

describe("Floating Shield", () => {
  it("sacrificed, grants the colour it named as it entered", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Llanowar Elves");
    a.chooseCreatureTypeFn = () => "R";
    const shield = toHand(game, "Floating Shield");
    cast(game, shield, { targets: [ref(bears)] });
    expect(zone(game, shield)).toBe("battlefield");
    expect(protectedFrom(game, bears)).toEqual(["R"]);
    activate(game, shield, 0, { targets: [ref(other)] });
    expect(zone(game, shield)).toBe("graveyard");
    expect(protectedFrom(game, other)).toEqual(["R"]);
    expect(protectedFrom(game, bears)).toEqual([]);
  });
});

describe("Dominaria's Judgment", () => {
  it("grants the colours of the basic land types you control, to your creatures only", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    lands(game, "Island", 1, B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Dominaria's Judgment"));
    expect(protectedFrom(game, bears)).toEqual(["R", "W"]);
    expect(protectedFrom(game, theirs)).toEqual([]);
  });
});

describe("Aven Warcraft", () => {
  it("without threshold: toughness only, no colour asked", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    cast(game, toHand(game, "Aven Warcraft"));
    expect(asked).toBe(false);
    expect(computeCharacteristics(game.state, registryOf(game), bears).toughness).toBe(4);
    expect(protectedFrom(game, bears)).toEqual([]);
  });

  it("with threshold: also the chosen colour", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    for (let i = 0; i < 7; i++) toGraveyard(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    cast(game, toHand(game, "Aven Warcraft"));
    expect(computeCharacteristics(game.state, registryOf(game), bears).toughness).toBe(4);
    expect(protectedFrom(game, bears)).toEqual(["B"]);
  });
});

describe("Reverent Mantra", () => {
  it("reaches every creature, an opponent's too", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 4);
    cast(game, toHand(game, "Reverent Mantra"));
    expect(protectedFrom(game, bears)).toEqual(["G"]);
    expect(protectedFrom(game, theirs)).toEqual(["G"]);
  });
});

describe("Feat of Resistance", () => {
  it("puts a counter on it and protects it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    cast(game, toHand(game, "Feat of Resistance"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(protectedFrom(game, bears)).toEqual(["U"]);
  });
});

describe("Pristine Skywise", () => {
  it("a noncreature spell untaps it and gives it the colour of your choice", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const skywise = spawn(game, "Pristine Skywise", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 3);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(game.state.objects[skywise].tapped).toBe(false);
    expect(protectedFrom(game, skywise)).toEqual(["R"]);
  });
});

describe("Questing Phelddagrif", () => {
  it("{W}: protection from black and red, and the target opponent gains 2 life", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const grif = spawn(game, "Questing Phelddagrif");
    const before = life(game, B);
    activate(game, grif, 1, { targets: [ref(B)] });
    expect(protectedFrom(game, grif)).toEqual(["B", "R"]);
    expect(life(game, B)).toBe(before + 2);
  });
});

describe("Sygg, River Guide", () => {
  it("targets only a Merfolk you control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const sygg = spawn(game, "Sygg, River Guide");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, sygg, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, sygg, 0, { targets: [ref(sygg)] });
    expect(protectedFrom(game, sygg)).toEqual(["W"]);
  });
});
