/**
 * Return to Ravnica (RTR) — group D of the set walk: populate, scavenge,
 * overload, and the punisher Demon.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  graveyard,

  keywords,
  lands,
  life,
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
  tokensNamed,
  zone,
  nextTurn,
} from "./harness.js";

describe("Desecration Demon", () => {
  it("is tapped and gets one counter however many opponents sacrifice", () => {
    const { game, b, c } = table({ players: 3 });
    const demon = spawn(game, "Desecration Demon");
    const bears = spawn(game, "Grizzly Bears", B);
    const ox = spawn(game, "Grizzly Bears", C);
    pickModes(b, 0);
    pickPermanents(b, bears);
    pickModes(c, 0);
    pickPermanents(c, ox);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ox)).toBe("graveyard");
    expect(counters(game, demon)).toBe(1);
    expect(game.state.objects[demon].tapped).toBe(true);
  });

  it("stays untapped with no counter when nobody sacrifices", () => {
    const { game, b } = table();
    const demon = spawn(game, "Desecration Demon");
    spawn(game, "Grizzly Bears", B);
    pickModes(b);
    toStep(game, "postcombat-main");
    expect(counters(game, demon)).toBe(0);
    expect(game.state.objects[demon].tapped).toBe(false);
  });
});

describe("Mana Bloom", () => {
  it("enters with X charge counters and taps for mana only once a turn", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bloom = toHand(game, "Mana Bloom");
    cast(game, bloom, { x: 2 });
    expect(counters(game, bloom, "charge")).toBe(2);
    activate(game, bloom, 0);
    expect(counters(game, bloom, "charge")).toBe(1);
    expect(() => activate(game, bloom, 0)).toThrow();
  });

  it("returns to hand at upkeep only with no charge counters", () => {
    const { game } = table();
    const kept = spawn(game, "Mana Bloom");
    game.state.objects[kept].counters.charge = 1;
    const empty = spawn(game, "Mana Bloom");
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, kept)).toBe("battlefield");
    expect(zone(game, empty)).toBe("hand");
  });
});

describe("Tavern Swindler", () => {
  it("pays 3 life, then gains 6 on a won flip", () => {
    const { game } = table();
    const swindler = spawn(game, "Tavern Swindler");
    activate(game, swindler);
    expect([17, 23]).toContain(life(game, A));
  });
});

describe("Chronic Flooding", () => {
  it("mills the enchanted land's controller three when it becomes tapped", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const theirs = spawn(game, "Wastes", B);
    cast(game, toHand(game, "Chronic Flooding"), { targets: [ref(theirs)] });
    const before = graveyard(game, B).length;
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(graveyard(game, B).length).toBe(before + 3);
  });
});

describe("Armada Wurm", () => {
  it("makes a 5/5 trampling Wurm as it enters", () => {
    const { game } = table();
    enter(game, "Armada Wurm");
    expect(tokensNamed(game, "Wurm Token (Trample)", A)).toBe(1);
  });
});

describe("Ash Zealot", () => {
  it("deals 3 to a player who casts a spell from a graveyard", () => {
    const { game } = table();
    spawn(game, "Ash Zealot", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Think Twice"));
    expect(life(game, A)).toBe(20);
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(life(game, A)).toBe(17);
  });
});

describe("Dynacharge", () => {
  it("overloaded, pumps each creature you control and none of theirs", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Dynacharge"), { overload: true });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Doorkeeper", () => {
  it("mills one card per defender you control", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const keeper = spawn(game, "Doorkeeper");
    spawn(game, "Doorkeeper");
    const before = graveyard(game, B).length;
    activate(game, keeper, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 2);
  });
});

describe("Swift Justice", () => {
  it("gives +1/+0, first strike and lifelink", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Swift Justice"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Trostani's Judgment", () => {
  it("exiles the creature, then copies a creature token you control", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    enter(game, "Armada Wurm");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Trostani's Judgment"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "Wurm Token (Trample)", A)).toBe(2);
  });
});

describe("Coursers' Accord", () => {
  it("makes a Centaur and populates it", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Coursers' Accord"));
    expect(tokensNamed(game, "3/3 Centaur Token", A)).toBe(2);
  });
});

describe("Slitherhead", () => {
  it("scavenges for {0}: one counter, the card exiled", () => {
    const { game } = table();
    const head = toGraveyard(game, "Slitherhead");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, head, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, head)).toBe("exile");
  });
});

describe("Deviant Glee", () => {
  it("gives +2/+1 and an {R} trample ability", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Deviant Glee"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    activate(game, bears, 0);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Racecourse Fury", () => {
  it("lets the enchanted land tap to give a creature haste", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const land = spawn(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    cast(game, toHand(game, "Racecourse Fury"), { targets: [ref(land)] });
    // Index 1: after Wastes's own mana ability.
    activate(game, land, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Pyroconvergence", () => {
  it("deals 2 when you cast a multicolored spell, not a mono-colored one", () => {
    const { game, a } = table();
    spawn(game, "Pyroconvergence");
    lands(game, "Forest", 3);
    lands(game, "Plains", 3);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Watchwolf"));
    expect(life(game, B)).toBe(18);
  });
});
