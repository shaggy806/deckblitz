/**
 * Set walk batch 87, part a (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const energy = (game: Game, player: PlayerId = A): number => game.state.players[player].energy;
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const tokensOf = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
/** The index of `source`'s activated ability that's offered and isn't its first (a land's own mana ability). */
const grantedIndex = (game: Game, source: ObjectId): number => {
  const offers = game
    .legalActions(A)
    .filter((a): a is Extract<typeof a, { kind: "activate-ability" }> => a.kind === "activate-ability" && a.source === source);
  return Math.max(...offers.map((a) => a.abilityIndex));
};

describe("Stone Idol Generator", () => {
  it("gives {E} for each creature you control that attacks, and six {E} make a 6/12 trampling Construct", () => {
    const { game, a } = table();
    const generator = spawn(game, "Stone Idol Generator");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    spawn(game, "Grizzly Bears", B);
    attack(game, a, bears);
    expect(energy(game)).toBe(2);
    expect(energy(game, B)).toBe(0);
    // Five short.
    expect(() => activate(game, generator)).toThrow();
    game.state.players[A].energy = 6;
    activate(game, generator);
    expect(energy(game)).toBe(0);
    expect(isTapped(game, generator)).toBe(true);
    const [construct] = tokensOf(game, "Construct Token (Ancient Stone Idol)", A);
    expect(pt(game, construct)).toEqual({ power: 6, toughness: 12 });
    expect(keywords(game, construct).has("trample")).toBe(true);
  });

  it("is activated only as a sorcery", () => {
    const { game } = table({ step: "upkeep" });
    const generator = spawn(game, "Stone Idol Generator");
    game.state.players[A].energy = 6;
    expect(() => activate(game, generator)).toThrow();
  });
});

describe("Polygoyf", () => {
  it("counts card types among cards in all graveyards", () => {
    const { game } = table();
    const goyf = spawn(game, "Polygoyf");
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
    toGraveyard(game, "Ornithopter", B);
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
  });

  it("myriad: a tapped and attacking token copy for the other opponent, exiled at end of combat", () => {
    const { game, a } = table({ players: 3 });
    const goyf = spawn(game, "Polygoyf");
    toGraveyard(game, "Ornithopter", B);
    pickModes(a, 0);
    attack(game, a, [goyf], B);
    // The copy has the characteristic-defining ability too, and trample.
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(tokensOf(game, "Polygoyf", A)).toHaveLength(0);
  });
});

describe("Trenchpost", () => {
  it("target player mills a card for each Locus you control", () => {
    const { game } = table();
    const post = spawn(game, "Trenchpost");
    spawn(game, "Trenchpost");
    lands(game, "Wastes", 3);
    const before = graveyard(game, B).length;
    activate(game, post, 1, { targets: [ref(B)] });
    expect(graveyard(game, B).length - before).toBe(2);
  });
});

describe("Broodmate Tyrant", () => {
  it("enters with a 5/5 flying Dragon", () => {
    const { game } = table();
    enter(game, "Broodmate Tyrant");
    const [dragon] = tokensOf(game, "Dragon Token", A);
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
  });

  it("encore: a hasty token copy for each opponent, whose own enters makes a Dragon", () => {
    const { game } = table({ players: 3 });
    const tyrant = toGraveyard(game, "Broodmate Tyrant");
    spawn(game, "Swamp");
    spawn(game, "Mountain");
    spawn(game, "Forest");
    lands(game, "Wastes", 5);
    activate(game, tyrant, 0);
    expect(zone(game, tyrant)).toBe("exile");
    const copies = tokensOf(game, "Broodmate Tyrant", A);
    expect(copies).toHaveLength(2);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(2);
  });
});

describe("Tarmogoyf Nest", () => {
  it("the enchanted land makes a Tarmogoyf token, a {1}{G} Lhurgoyf with Tarmogoyf's ability", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Tarmogoyf Nest"), { targets: [ref(land)] });
    game.state.objects[land].tapped = false;
    lands(game, "Forest", 2);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Lightning Bolt", B);
    activate(game, land, grantedIndex(game, land));
    expect(isTapped(game, land)).toBe(true);
    const [goyf] = tokensOf(game, "Tarmogoyf Token", A);
    // Creature and instant in graveyards (the Nest's own kindred enchantment is on the battlefield).
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
    expect(registryOf(game).get("Tarmogoyf Token").manaCost).toBe("{1}{G}");
  });
});

describe("Angelic Aberration", () => {
  it("sacrifices any number of creatures with base power or toughness 1 or less, and makes that many Angels", () => {
    const { game, a } = table();
    const elves = spawn(game, "Llanowar Elves");
    // A counter doesn't change its base power and toughness.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(elves)]);
    const wall = spawn(game, "Wall of Roots");
    const bears = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    const theirs = spawn(game, "Llanowar Elves", B);
    const seen = pickPermanents(a, elves, wall);
    enter(game, "Angelic Aberration");
    expect([...seen.offered].sort()).toEqual([elves, wall, memnite].sort());
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, memnite)).toBe("battlefield");
    const angels = tokensOf(game, "Eldrazi Angel Token", A);
    expect(tokensNamed(game, "Eldrazi Angel Token", A)).toBe(2);
    expect(pt(game, angels[0])).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, angels[0]).has("vigilance")).toBe(true);
  });

  it("sacrificing none makes none", () => {
    const { game, a } = table();
    spawn(game, "Memnite");
    pickPermanents(a);
    enter(game, "Angelic Aberration");
    expect(tokensNamed(game, "Eldrazi Angel Token")).toBe(0);
  });
});

describe("Jyoti, Moag Ancient", () => {
  it("makes a Forest Dryad for each time you've cast either of your commanders from the command zone", () => {
    const { game } = table();
    game.state.players[A].commanderCastCounts["Tymna the Weaver"] = 1;
    game.state.players[A].commanderCastCounts["Thrasios, Triton Hero"] = 2;
    enter(game, "Jyoti, Moag Ancient");
    expect(tokensNamed(game, "Forest Dryad Token", A)).toBe(3);
  });

  it("at the beginning of each combat, your land creatures get +X/+X where X is Jyoti's power", () => {
    const { game } = table();
    const jyoti = spawn(game, "Jyoti, Moag Ancient");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(jyoti)]);
    game.debugApplyEffect(A, { kind: "create-token", token: "Forest Dryad Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Forest Dryad Token", count: 1 });
    const [mine] = tokensOf(game, "Forest Dryad Token", A);
    const [theirs] = tokensOf(game, "Forest Dryad Token", B);
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(counters(game, jyoti)).toBe(1);
  });

  it("triggers on an opponent's combat too", () => {
    const { game } = table();
    spawn(game, "Jyoti, Moag Ancient");
    game.debugApplyEffect(A, { kind: "create-token", token: "Forest Dryad Token", count: 1 });
    const [mine] = tokensOf(game, "Forest Dryad Token", A);
    toStep(game, "begin-combat", B);
    settle(game);
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Aurora Shifter", () => {
  it("pays {E}{E} to become a copy of another creature, keeping both its abilities", () => {
    const { game, a } = table();
    const shifter = spawn(game, "Aurora Shifter");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.state.players[A].energy = 3;
    pickModes(a, 0);
    a.chooseTargetsFn = () => [ref(giant)];
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(1);
    expect(pt(game, shifter)).toEqual({ power: 3, toughness: 3 });
    // Its combat damage ability came along: 3 damage, 3 {E}.
    attack(game, a, [shifter]);
    expect(life(game, B)).toBe(17);
    expect(energy(game)).toBe(4);
    // And this ability: next combat it may become a copy again.
    toStep(game, "begin-combat");
    settle(game);
    expect(energy(game)).toBe(2);
  });

  it("can't pay with fewer than two {E}, and deals its own damage as energy", () => {
    const { game, a } = table();
    const shifter = spawn(game, "Aurora Shifter");
    spawn(game, "Grizzly Bears");
    game.state.players[A].energy = 1;
    pickModes(a, 0);
    attack(game, a, [shifter]);
    expect(pt(game, shifter)).toEqual({ power: 1, toughness: 3 });
    expect(energy(game)).toBe(2);
  });
});

describe("Silverquill Lecturer", () => {
  it("a creature spell you cast has demonstrate: you copy it, then an opponent does", () => {
    const { game, a } = table();
    spawn(game, "Silverquill Lecturer");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
    expect(tokensOf(game, "Grizzly Bears", A)).toHaveLength(1);
    const theirs = tokensOf(game, "Grizzly Bears", B);
    expect(theirs).toHaveLength(1);
    expect(controller(game, theirs[0])).toBe(B);
  });

  it("declining, nobody copies it; and a noncreature spell doesn't have it", () => {
    const { game, a } = table();
    spawn(game, "Silverquill Lecturer");
    lands(game, "Forest", 2);
    pickModes(a);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
    spawn(game, "Mountain");
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("an opponent's Lecturer doesn't give your creature spells demonstrate", () => {
    const { game, a, b } = table();
    spawn(game, "Silverquill Lecturer", B);
    lands(game, "Forest", 2);
    pickModes(a, 0);
    pickModes(b, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears")).toHaveLength(1);
  });
});
