/**
 * Stronghold (STH; B184) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Mob Justice", () => {
  it("deals damage equal to the creatures its caster controls", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Mob Justice"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Wall of Essence", () => {
  it("gains life from combat damage dealt to it, not from other damage", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const wall = spawn(game, "Wall of Essence", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(23);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(wall)] });
    expect(life(game, B)).toBe(23);
  });
});

describe("Jinxed Ring", () => {
  it("deals 1 damage to you when a nontoken permanent of yours goes to your graveyard", () => {
    const { game } = table();
    spawn(game, "Jinxed Ring");
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, forest);
    expect(life(game, A)).toBe(19);
    destroy(game, theirs);
    expect(life(game, A)).toBe(19);
  });
});

describe("Thalakos Deceiver", () => {
  it("is sacrificed unblocked to gain control of the target", () => {
    const { game, a } = table();
    const deceiver = spawn(game, "Thalakos Deceiver");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    attack(game, a, [deceiver]);
    expect(zone(game, deceiver)).toBe("graveyard");
    expect(controller(game, giant)).toBe(A);
    expect(life(game, B)).toBe(20);
  });
});

describe("Revenant", () => {
  it("is as big as the creature cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears", B);
    const revenant = spawn(game, "Revenant");
    expect(pt(game, revenant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Heat of Battle", () => {
  it("deals 1 damage to a blocking creature's controller", () => {
    const { game, a, b } = table();
    spawn(game, "Heat of Battle");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Bullwhip", () => {
  it("deals 1 damage to the target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const whip = spawn(game, "Bullwhip");
    const elf = spawn(game, "Llanowar Elves", B);
    activate(game, whip, 0, { targets: [ref(elf)] });
    expect(zone(game, elf)).toBe("graveyard");
  });
});

describe("Crovax the Cursed", () => {
  it("enters with four counters; grows on a sacrifice, shrinks without one", () => {
    const { game, a } = table();
    const crovax = enter(game, "Crovax the Cursed");
    expect(counters(game, crovax)).toBe(4);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, crovax)).toBe(5);
    pickModes(a);
    toStep(game, "draw");
    expect(counters(game, crovax)).toBe(4);
  });

  it("{B} gives it flying", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const crovax = enter(game, "Crovax the Cursed");
    toStep(game, "precombat-main");
    activate(game, crovax);
    expect(keywords(game, crovax).has("flying")).toBe(true);
  });
});

describe("Warrior Angel", () => {
  it("Warrior Angel gains its controller the damage it deals", () => {
    const { game, a } = table();
    const angel = spawn(game, "Warrior Angel");
    attack(game, a, [angel]);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Dream Prowler", () => {
  it("can't be blocked attacking alone", () => {
    const { game, a, b } = table();
    const prowler = spawn(game, "Dream Prowler");
    const wall = spawn(game, "Wall of Essence", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: prowler }];
    attack(game, a, [prowler]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Spindrift Drake", () => {
  it("is sacrificed at upkeep when {U} isn't paid", () => {
    const { game } = table();
    const drake = spawn(game, "Spindrift Drake");
    toStep(game, "draw");
    expect(zone(game, drake)).toBe("graveyard");
  });
});
