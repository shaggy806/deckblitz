/**
 * Visions (VIS; B172), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Everglades", () => {
  it("stays if an untapped Swamp is returned", () => {
    const { game, a } = table();
    const swamp = spawn(game, "Swamp");
    pickPermanents(a, swamp);
    const glades = enter(game, "Everglades");
    expect(zone(game, glades)).toBe("battlefield");
    expect(game.state.objects[glades].tapped).toBe(true);
    expect(zone(game, swamp)).toBe("hand");
  });

  it("is sacrificed when the only Swamp is tapped", () => {
    const { game, a } = table();
    const swamp = spawn(game, "Swamp", A, { tapped: true });
    const seen = pickPermanents(a, swamp);
    const glades = enter(game, "Everglades");
    expect(seen.offered).not.toContain(swamp);
    expect(zone(game, glades)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("battlefield");
  });
});

describe("Nekrataal", () => {
  it("destroys a nonblack creature, which can't regenerate", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bear)];
    enter(game, "Nekrataal");
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("Miraculous Recovery", () => {
  it("returns the creature and puts a +1/+1 counter on it", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bear = toGraveyard(game, "Grizzly Bears");
    const spell = toHand(game, "Miraculous Recovery");
    cast(game, spell, { targets: [ref(bear)] });
    const [back] = named(game, "Grizzly Bears", A);
    expect(zone(game, back)).toBe("battlefield");
    expect(counters(game, back)).toBe(1);
    expect(pt(game, back)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sun Clasp", () => {
  it("returns the enchanted creature to its owner's hand", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    const clasp = toHand(game, "Sun Clasp");
    cast(game, clasp, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 5 });
    activate(game, clasp);
    expect(hand(game, B)).toContain(bear);
  });
});

describe("Undo", () => {
  it("returns two creatures to their owners' hands", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Undo");
    cast(game, spell, { targets: [ref(mine), ref(theirs)] });
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
  });
});

describe("Juju Bubble", () => {
  it("is sacrificed when you play a land", () => {
    const { game } = table();
    const bubble = spawn(game, "Juju Bubble");
    const swamp = toHand(game, "Swamp");
    game.dispatch({ type: "play-land", player: A, card: swamp });
    settle(game);
    expect(zone(game, bubble)).toBe("graveyard");
  });

  it("gains 1 life for {2}", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bubble = spawn(game, "Juju Bubble");
    activate(game, bubble);
    expect(life(game, A)).toBe(21);
  });
});

describe("Tin-Wing Chimera", () => {
  it("puts a +2/+2 counter and flying on a Chimera", () => {
    const { game } = table();
    const tin = spawn(game, "Tin-Wing Chimera");
    const other = spawn(game, "Horizon Chimera");
    const before = pt(game, other);
    game.dispatch({ type: "activate-ability", player: A, source: tin, abilityIndex: 0, targets: [ref(other)], sacrifice: tin });
    settle(game);
    expect(zone(game, tin)).toBe("graveyard");
    expect(counters(game, other, "+2/+2")).toBe(1);
    expect(pt(game, other)).toEqual({ power: before.power + 2, toughness: before.toughness + 2 });
    expect(keywords(game, other).has("flying")).toBe(true);
  });
});

describe("Quirion Druid", () => {
  it("makes a land a 2/2 green creature land", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const druid = spawn(game, "Quirion Druid");
    const land = spawn(game, "Wastes", B);
    activate(game, druid, 0, { targets: [ref(land)] });
    expect(types(game, land)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, land)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[land].zone).toBe("battlefield");
  });
});

describe("Wind Shear", () => {
  it("shrinks attacking fliers and takes their flying", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const angel = spawn(game, "Serra Angel");
    const bear = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: angel, defender: B },
      { attacker: bear, defender: B },
    ];
    toStep(game, "declare-blockers");
    const shear = toHand(game, "Wind Shear");
    cast(game, shear);
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Suleiman's Legacy", () => {
  it("destroys a Djinn that enters later", () => {
    const { game } = table();
    spawn(game, "Suleiman's Legacy");
    const djinn = enter(game, "Mahamoti Djinn", B);
    expect(zone(game, djinn)).toBe("graveyard");
  });

  it("destroys the Djinns already there as it enters", () => {
    const { game } = table();
    const djinn = spawn(game, "Mahamoti Djinn", B);
    const bear = spawn(game, "Grizzly Bears", B);
    enter(game, "Suleiman's Legacy");
    expect(zone(game, djinn)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Hearth Charm", () => {
  it("destroys an artifact creature", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    const jugg = spawn(game, "Juggernaut", B);
    const charm = toHand(game, "Hearth Charm");
    cast(game, charm, { modes: [0], targets: [ref(jugg)] });
    expect(zone(game, jugg)).toBe("graveyard");
  });
});
