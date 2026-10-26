/** Lorwyn (batch 192), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong. */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Cenn's Heir", () => {
  it("gets +1/+1 for each other attacking Kithkin", () => {
    const { game, a } = table();
    const heirs = [spawn(game, "Cenn's Heir"), spawn(game, "Cenn's Heir"), spawn(game, "Cenn's Heir")];
    attack(game, a, heirs);
    expect(pt(game, heirs[0])).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Hunter of Eyeblights", () => {
  it("counters an opponent's creature, then destroys only a creature with a counter", () => {
    const { game, a } = table();
    const marked = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Hill Giant", B);
    pickTargets(a, marked);
    const hunter = enter(game, "Hunter of Eyeblights");
    expect(counters(game, marked)).toBe(1);
    lands(game, "Swamp", 3);
    expect(() => activate(game, hunter, 0, { targets: [ref(plain)] })).toThrow();
    activate(game, hunter, 0, { targets: [ref(marked)] });
    expect(zone(game, marked)).toBe("graveyard");
  });
});

describe("Harpoon Sniper", () => {
  it("deals damage equal to the number of Merfolk you control to an attacking creature", () => {
    const { game, a } = table();
    const sniper = spawn(game, "Harpoon Sniper");
    spawn(game, "Stonybrook Angler");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    activate(game, sniper, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Giant's Ire", () => {
  it("deals 4 and draws only while you control a Giant", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Giant's Ire"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(hand(game, A).length).toBe(before);
    spawn(game, "Hill Giant");
    cast(game, toHand(game, "Giant's Ire"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Warren Pilferers", () => {
  it("gains haste only when the returned card is a Goblin", () => {
    const { game, a } = table();
    const goblin = toGraveyard(game, "Goblin Piledriver");
    pickTargets(a, goblin);
    const first = enter(game, "Warren Pilferers");
    expect(zone(game, goblin)).toBe("hand");
    expect(keywords(game, first).has("haste")).toBe(true);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const second = enter(game, "Warren Pilferers");
    expect(zone(game, bears)).toBe("hand");
    expect(keywords(game, second).has("haste")).toBe(false);
  });
});

describe("Hurly-Burly", () => {
  it("the flying mode damages only creatures with flying", () => {
    const { game } = table();
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Hurly-Burly"), { modes: [1] });
    expect(zone(game, birds)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Inner-Flame Igniter", () => {
  it("grants first strike only on the third resolution this turn", () => {
    const { game } = table();
    const igniter = spawn(game, "Inner-Flame Igniter");
    lands(game, "Mountain", 9);
    activate(game, igniter, 0);
    activate(game, igniter, 0);
    expect(pt(game, igniter).power).toBe(4);
    expect(keywords(game, igniter).has("first-strike")).toBe(false);
    activate(game, igniter, 0);
    expect(pt(game, igniter).power).toBe(5);
    expect(keywords(game, igniter).has("first-strike")).toBe(true);
  });
});

describe("Benthicore", () => {
  it("makes two Merfolk Wizards, which tap to untap it and give it shroud", () => {
    const { game } = table();
    const benthicore = enter(game, "Benthicore");
    expect(tokensNamed(game, "Merfolk Wizard Token", A)).toBe(2);
    game.state.objects[benthicore].tapped = true;
    activate(game, benthicore, 0);
    expect(game.state.objects[benthicore].tapped).toBe(false);
    expect(keywords(game, benthicore).has("shroud")).toBe(true);
  });
});

describe("Lash Out", () => {
  it("deals 3 to the creature and, on a won clash, 3 to its controller", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lash Out"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Bog-Strider Ash", () => {
  it("may pay {G} to gain 2 life when a Goblin spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Bog-Strider Ash");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Goblin Piledriver"), { settle: false });
    spawn(game, "Forest");
    settle(game);
    expect(life(game, A)).toBe(22);
  });
});

describe("Nath's Buffoon", () => {
  it("can't be targeted by an Elf's ability", () => {
    const { game, a } = table();
    const buffoon = spawn(game, "Nath's Buffoon", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Hunter of Eyeblights");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered[0]).not.toContain(buffoon);
  });
});

describe("Quill-Slinger Boggart", () => {
  it("may have target player lose 1 life when a Kithkin spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Quill-Slinger Boggart");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Cenn's Heir"));
    expect(life(game, B)).toBe(19);
  });
});
