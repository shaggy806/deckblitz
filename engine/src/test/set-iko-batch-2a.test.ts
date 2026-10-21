/**
 * Ikoria: Lair of Behemoths — mutate cards, group a (batch 2a): the
 * "whenever this creature mutates" payoffs, the mutate-matters creatures
 * (Essence Symbiote, Zagoth Mamba, Pollywog Symbiote) and Parcelbeast.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const ON_TOP = 0;
const UNDER = 1;

/** The seat answers each modes question with the next of `answers` (a
 * mutate's over/under, then a `may`), and "no" once they run out. */
function modesInTurn(seat: ScriptedController, ...answers: (readonly number[])[]): void {
  const left = [...answers];
  seat.chooseModesFn = () => [...(left.shift() ?? [])];
}

describe("Huntmaster Liger", () => {
  it("gives the other creatures you control +X/+X, X the times it has mutated", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Huntmaster Liger"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Regal Leosaur", () => {
  it("mutated underneath, pumps the other creatures but not the merged one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    pickModes(a, UNDER);
    cast(game, toHand(game, "Regal Leosaur"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, other)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Essence Symbiote", () => {
  it("puts a +1/+1 counter on the creature that mutated and gains 2 life", () => {
    const { game, a } = table();
    const symbiote = spawn(game, "Essence Symbiote");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Vulpikeet"), { overload: true, targets: [ref(bears)] });
    // Vulpikeet's own counter and the Symbiote's.
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, symbiote)).toBe(0);
    expect(life(game)).toBe(22);
  });
});

describe("Zagoth Mamba", () => {
  it("triggers when a creature mutates onto it", () => {
    const { game, a } = table();
    const mamba = spawn(game, "Zagoth Mamba");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    pickModes(a, UNDER);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Vulpikeet"), { overload: true, targets: [ref(mamba)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Insatiable Hemophage", () => {
  it("drains each opponent for the times it has mutated", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Insatiable Hemophage"), { overload: true, targets: [ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    // X life, not X per opponent.
    expect(life(game)).toBe(21);
  });
});

describe("Illuna, Apex of Wishes", () => {
  it("exiles to a nonland permanent card, which may go to the hand instead; the rest stay exiled", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Forest", 4);
    const found = toLibrary(game, "Hill Giant");
    const sorcery = toLibrary(game, "Divination");
    const land = toLibrary(game, "Forest");
    modesInTurn(a, [ON_TOP], []);
    cast(game, toHand(game, "Illuna, Apex of Wishes"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, found)).toBe("hand");
    expect(zone(game, sorcery)).toBe("exile");
    expect(zone(game, land)).toBe("exile");
  });

  it("or puts it onto the battlefield", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Forest", 4);
    const found = toLibrary(game, "Hill Giant");
    modesInTurn(a, [ON_TOP], [0]);
    cast(game, toHand(game, "Illuna, Apex of Wishes"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, found)).toBe("battlefield");
  });
});

describe("Everquill Phoenix", () => {
  it("makes a Feather that returns a Phoenix card from the graveyard tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const fallen = toGraveyard(game, "Everquill Phoenix");
    lands(game, "Mountain", 5);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Everquill Phoenix"), { overload: true, targets: [ref(bears)] });
    expect(tokensNamed(game, "Feather Token", A)).toBe(1);
    expect(registryOf(game).get("Feather Token").tokenName).toBe("Feather");
    const feather = named(game, "Feather Token")[0];
    activate(game, feather, 0, { targets: [ref(fallen)] });
    expect(zone(game, fallen)).toBe("battlefield");
    expect(game.state.objects[fallen].tapped).toBe(true);
    expect(tokensNamed(game, "Feather Token", A)).toBe(0);
  });
});

describe("Pollywog Symbiote", () => {
  it("makes a mutate spell cost {1} less, even for its mutate cost, and loots on the cast", () => {
    const { game, a } = table();
    spawn(game, "Pollywog Symbiote");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const keet = toHand(game, "Vulpikeet");
    const before = hand(game).length;
    const discarded = graveyard(game).length;
    pickModes(a, ON_TOP);
    cast(game, keet, { overload: true, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game).length).toBe(discarded + 1);
  });

  it("doesn't trigger on a creature spell without mutate", () => {
    const { game } = table();
    spawn(game, "Pollywog Symbiote");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Nethroi, Apex of Death", () => {
  it("returns any number of creature cards with total power 10 or less", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const cub = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 6);
    lands(game, "Plains", 1);
    pickModes(a, ON_TOP);
    pickTargets(a, giant, cub);
    cast(game, toHand(game, "Nethroi, Apex of Death"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, cub)).toBe("battlefield");
  });
});

describe("Vadrok, Apex of Thunder", () => {
  it("may cast a noncreature card with mana value 3 or less from the graveyard for free", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const divination = toGraveyard(game, "Divination");
    lands(game, "Mountain", 3);
    lands(game, "Island", 1);
    const vadrok = toHand(game, "Vadrok, Apex of Thunder");
    const before = hand(game).length;
    pickModes(a, ON_TOP);
    pickTargets(a, divination);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === divination);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: divination, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, vadrok, { overload: true, targets: [ref(bears)] });
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(zone(game, divination)).toBe("graveyard");
  });
});

describe("Sawtusk Demolisher", () => {
  it("destroys a noncreature permanent and its controller gets a 3/3 Beast", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirLand = spawn(game, "Forest", B);
    lands(game, "Forest", 4);
    pickModes(a, ON_TOP);
    pickTargets(a, theirLand);
    cast(game, toHand(game, "Sawtusk Demolisher"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, theirLand)).toBe("graveyard");
    expect(tokensNamed(game, "3/3 Beast Token", B)).toBe(1);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(0);
  });
});

describe("Snapdax, Apex of the Hunt", () => {
  it("deals 4 damage to an opponent's creature and gains 4 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    lands(game, "Mountain", 3);
    pickModes(a, ON_TOP);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Snapdax, Apex of the Hunt"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game)).toBe(24);
  });
});

describe("Parcelbeast", () => {
  it("puts a land on top onto the battlefield", () => {
    const { game, a } = table();
    const beast = spawn(game, "Parcelbeast");
    lands(game, "Wastes", 1);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    activate(game, beast);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("puts anything else into the hand", () => {
    const { game } = table();
    const beast = spawn(game, "Parcelbeast");
    lands(game, "Wastes", 1);
    const giant = toLibrary(game, "Hill Giant");
    activate(game, beast);
    expect(zone(game, giant)).toBe("hand");
  });
});
