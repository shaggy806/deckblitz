/**
 * Innistrad / Dark Ascension, batch 188 group E: the clauses most likely to
 * be wrong — Lost in the Woods' per-attacker reveal, Trepanation Blade's
 * count of revealed cards, Delver's transform, Ghoulcaller's Chant's Zombie
 * mode, Tribute to Hunger's toughness, Heavy Mattock's Human bonus.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  life,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Lost in the Woods", () => {
  it("a Forest on top removes the attacker from combat; the card goes to the bottom", () => {
    const { game, b } = table();
    spawn(game, "Lost in the Woods");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest", A);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(forest);
  });

  it("anything else leaves the attacker in combat, and still goes to the bottom", () => {
    const { game, b } = table();
    spawn(game, "Lost in the Woods");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant", A);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(18);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(giant);
  });
});

describe("Trepanation Blade", () => {
  it("pumps +1/+0 per card revealed, the land included, and mills them all", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const blade = spawn(game, "Trepanation Blade");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, blade, 0, { targets: [ref(bears)] });
    // Bob's library, top down: two Bears, then a Forest, then more Bears.
    const forest = toLibrary(game, "Forest", B);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [bears]);
    expect(zone(game, forest)).toBe("graveyard");
    expect(graveyard(game, B)).toHaveLength(3);
    expect(life(game, B)).toBe(15);
    expect(pt(game, bears).power).toBe(5);
  });
});

describe("Delver of Secrets", () => {
  it("transforms on revealing an instant on top at upkeep", () => {
    const { game, a } = table();
    const delver = spawn(game, "Delver of Secrets");
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[delver].face).toBe(1);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bolt);
  });
});

describe("Ghoulcaller's Chant", () => {
  it("the second mode returns two Zombie cards", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const z1 = toGraveyard(game, "Walking Corpse");
    const z2 = toGraveyard(game, "Walking Corpse");
    const chant = toHand(game, "Ghoulcaller's Chant");
    pickModes(a, 1);
    pickTargets(a, z1, z2);
    cast(game, chant, { modes: [1], targets: [ref(z1), ref(z2)] });
    expect(hand(game)).toContain(z1);
    expect(hand(game)).toContain(z2);
  });
});

describe("Tribute to Hunger", () => {
  it("gains life equal to the sacrificed creature's toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Hill Giant", B);
    const tribute = toHand(game, "Tribute to Hunger");
    cast(game, tribute, { targets: [ref(B)] });
    expect(life(game, A)).toBe(23);
  });
});

describe("Heavy Mattock", () => {
  it("gives a Human +2/+2 and anything else +1/+1", () => {
    const { game } = table();
    const mattock = spawn(game, "Heavy Mattock");
    const human = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 4);
    activate(game, mattock, 0, { targets: [ref(human)] });
    expect(pt(game, human)).toEqual({ power: 4, toughness: 3 });
    activate(game, mattock, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});
