/**
 * Magic 2015 and Conspiracy, group C: each test written from the card's Oracle
 * text and rulings, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Garruk, Apex Predator", () => {
  it("−3 destroys the creature and gains life equal to its toughness", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk, Apex Predator");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, garruk, -3, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });

  it("−8 gives the opponent an emblem: a creature attacking them gets +5/+5 and trample", () => {
    const { game, a } = table();
    const garruk = spawn(game, "Garruk, Apex Predator");
    loyalty(game, garruk, -8, { targets: [ref(B)], atLeast: 8 });
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(life(game, B)).toBe(13);
  });
});

describe("Hot Soup", () => {
  it("destroys the equipped creature when it's dealt damage", () => {
    const { game } = table();
    const soup = spawn(game, "Hot Soup");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, soup, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Kurkesh, Onakke Ancient", () => {
  it("pays {R} to copy an artifact's ability", () => {
    const { game, a } = table();
    spawn(game, "Kurkesh, Onakke Ancient");
    const tome = spawn(game, "Jayemdae Tome");
    lands(game, "Mountain", 5);
    pickModes(a, 0);
    const before = hand(game).length;
    activate(game, tome, 0);
    expect(hand(game).length).toBe(before + 2);
  });

  it("doesn't see a creature's ability", () => {
    const { game, a } = table();
    spawn(game, "Kurkesh, Onakke Ancient");
    const oracle = spawn(game, "Oracle of Nectars");
    lands(game, "Mountain", 5);
    pickModes(a, 0);
    activate(game, oracle, 0, { x: 2 });
    expect(life(game, A)).toBe(22);
  });
});

describe("Ignition Team", () => {
  it("enters with a counter per tapped land, any player's, and animates a land for one", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) spawn(game, "Wastes", A, { tapped: true });
    const bobs = [spawn(game, "Wastes", B, { tapped: true }), spawn(game, "Wastes", B, { tapped: true })];
    spawn(game, "Wastes", B);
    const team = enter(game, "Ignition Team");
    expect(counters(game, team)).toBe(5);
    lands(game, "Mountain", 3);
    activate(game, team, 0, { targets: [ref(bobs[0])] });
    expect(counters(game, team)).toBe(4);
    expect(pt(game, bobs[0])).toEqual({ power: 4, toughness: 4 });
    expect(types(game, bobs[0])).toEqual(expect.arrayContaining(["land", "creature"]));
  });
});

describe("Dack's Duplicate", () => {
  it("copies a creature with haste and dethrone", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    a.chooseCopyFn = () => bears;
    const card = toHand(game, "Dack's Duplicate");
    cast(game, card);
    const dup = named(game, "Dack's Duplicate", A)[0] ?? card;
    expect(game.state.objects[dup].copyOf).toBe("Grizzly Bears");
    expect(keywords(game, dup).has("haste")).toBe(true);
    // Tied for the most life: dethrone puts a counter on it before damage.
    attack(game, a, [dup]);
    expect(counters(game, dup)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Coercive Portal", () => {
  it("a tied vote draws a card", () => {
    const { game, a, b } = table();
    const portal = spawn(game, "Coercive Portal");
    pickModes(a, 0);
    pickModes(b, 1);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, portal)).toBe("battlefield");
  });

  it("carnage winning sacrifices it and destroys every nonland permanent", () => {
    const { game, a, b } = table();
    const portal = spawn(game, "Coercive Portal");
    const bears = spawn(game, "Grizzly Bears", B);
    const wastes = spawn(game, "Wastes", B);
    pickModes(a, 0);
    pickModes(b, 0);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, portal)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Muzzio, Visionary Architect", () => {
  it("looks at as many cards as the greatest artifact mana value, offering artifacts", () => {
    const { game, a } = table();
    const muzzio = spawn(game, "Muzzio, Visionary Architect");
    spawn(game, "Jayemdae Tome"); // mana value 4
    const deep = toLibrary(game, "Sol Ring"); // fifth from the top: not looked at
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 4);
    const seen = pickFromZone(a, ring);
    activate(game, muzzio, 0);
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, deep)).toBe("library");
  });
});

describe("Undergrowth Scavenger", () => {
  it("counts creature cards in every graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest", A);
    const scavenger = enter(game, "Undergrowth Scavenger");
    expect(counters(game, scavenger)).toBe(2);
    expect(graveyard(game, A).length).toBe(2);
  });
});

describe("Hunter's Ambush", () => {
  it("prevents combat damage from nongreen creatures only", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Hunter's Ambush"));
    attack(game, a, [bears, giant]);
    expect(life(game, B)).toBe(18);
  });
});
