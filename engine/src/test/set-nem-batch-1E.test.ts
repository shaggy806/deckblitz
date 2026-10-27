import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

// Nemesis (NEM), batch 223 group E.

describe("Phyrexian Prowler", () => {
  it("fades a counter each upkeep, pays its pump with one, and is sacrificed when none is left", () => {
    const { game } = table();
    const prowler = enter(game, "Phyrexian Prowler");
    expect(counters(game, prowler, "fade")).toBe(3);
    activate(game, prowler);
    activate(game, prowler);
    expect(counters(game, prowler, "fade")).toBe(1);
    expect(pt(game, prowler)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "precombat-main");
    expect(counters(game, prowler, "fade")).toBe(0);
    expect(zone(game, prowler)).toBe("battlefield");
    toStep(game, "precombat-main");
    expect(zone(game, prowler)).toBe("graveyard");
  });
});

describe("Woodripper", () => {
  it("removes a fade counter to destroy an artifact", () => {
    const { game } = table();
    const ripper = enter(game, "Woodripper");
    const relic = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 1);
    activate(game, ripper, 0, { targets: [ref(relic)] });
    expect(zone(game, relic)).toBe("graveyard");
    expect(counters(game, ripper, "fade")).toBe(2);
  });
});

describe("Ascendant Evincar", () => {
  it("pumps other black creatures on every side and shrinks nonblack ones", () => {
    const { game } = table();
    const evincar = spawn(game, "Ascendant Evincar");
    const ours = spawn(game, "Phyrexian Prowler");
    const theirs = spawn(game, "Rathi Assassin", B);
    const bear = spawn(game, "Grizzly Bears", B);
    expect(pt(game, evincar)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, ours)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bear)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Spiritual Asylum", () => {
  it("gives creatures and lands shroud, and is sacrificed when a creature attacks", () => {
    const { game, a } = table();
    const asylum = spawn(game, "Spiritual Asylum");
    const bear = spawn(game, "Grizzly Bears");
    const [forest] = lands(game, "Forest", 1);
    expect(keywords(game, bear).has("shroud")).toBe(true);
    expect(keywords(game, forest).has("shroud")).toBe(true);
    attack(game, a, [bear]);
    expect(zone(game, asylum)).toBe("graveyard");
    expect(keywords(game, bear).has("shroud")).toBe(false);
  });
});

describe("Death Pit Offering", () => {
  it("sacrifices its controller's creatures as it enters, then pumps the next ones", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Death Pit Offering");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const next = spawn(game, "Grizzly Bears");
    expect(pt(game, next)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Complex Automaton", () => {
  it("returns to hand in its controller's upkeep only with seven or more permanents", () => {
    const { game } = table();
    const automaton = spawn(game, "Complex Automaton");
    lands(game, "Wastes", 5);
    toStep(game, "precombat-main");
    expect(zone(game, automaton)).toBe("battlefield");
    lands(game, "Wastes", 1);
    toStep(game, "precombat-main");
    expect(zone(game, automaton)).toBe("hand");
  });
});

describe("Lin Sivvi, Defiant Hero", () => {
  it("finds a Rebel with mana value X or less, and puts a Rebel card from the graveyard on the bottom", () => {
    const { game, a } = table();
    const lin = spawn(game, "Lin Sivvi, Defiant Hero");
    const falcon = toLibrary(game, "Defiant Falcon");
    lands(game, "Plains", 5);
    const seen = pickFromZone(a, falcon);
    activate(game, lin, 0, { x: 2 });
    expect(seen.offered).toContain(falcon);
    expect(zone(game, falcon)).toBe("battlefield");

    const dead = game.debugSpawn("Defiant Falcon", A, "graveyard");
    activate(game, lin, 1, { targets: [ref(dead)] });
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(dead);
  });

  it("doesn't offer a Rebel above X", () => {
    const { game, a } = table();
    const lin = spawn(game, "Lin Sivvi, Defiant Hero");
    const falcon = toLibrary(game, "Defiant Falcon");
    lands(game, "Plains", 1);
    const seen = pickFromZone(a);
    activate(game, lin, 0, { x: 1 });
    expect(seen.offered).not.toContain(falcon);
    expect(zone(game, falcon)).toBe("library");
  });
});

describe("Trickster Mage", () => {
  it("discards a card to untap a tapped land", () => {
    const { game, a } = table();
    const mage = spawn(game, "Trickster Mage");
    lands(game, "Island", 1);
    const tapped = spawn(game, "Forest", B, { tapped: true });
    const before = hand(game, A).length;
    const fodder = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [fodder];
    pickModes(a, 1);
    activate(game, mage, 0, { targets: [ref(tapped)] });
    expect(graveyard(game, A)).toContain(fodder);
    expect(hand(game, A).length).toBe(before);
    expect(game.state.objects[tapped].tapped).toBe(false);
  });
});

describe("Dominate", () => {
  it("takes a creature with mana value X or less", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const spell = toHand(game, "Dominate");
    cast(game, spell, { x: 2, targets: [ref(bear)] });
    expect(controller(game, bear)).toBe(A);
  });
});
