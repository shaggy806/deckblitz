/**
 * Set walk batch 124, group D (2026-10-21): Ravnica Allegiance (RNA).
 * Written on the shared table in `harness.ts`.
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
  named,
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
  zone,
} from "./harness.js";

describe("Biogenic Ooze", () => {
  it("makes an Ooze as it enters, and grows each Ooze you control at your end step", () => {
    const { game } = table();
    const ooze = enter(game, "Biogenic Ooze");
    expect(tokensNamed(game, "Ooze Token", A)).toBe(1);
    const token = named(game, "Ooze Token", A)[0];
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, ooze)).toBe(1);
    expect(counters(game, token)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Rampage of the Clans", () => {
  it("gives each controller a Centaur per permanent of theirs destroyed; an indestructible one doesn't count", () => {
    const { game } = table();
    spawn(game, "Sol Ring", A);
    spawn(game, "Glorious Anthem", A);
    spawn(game, "Sol Ring", B);
    const ingot = spawn(game, "Darksteel Ingot", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Rampage of the Clans"));
    expect(tokensNamed(game, "3/3 Centaur Token", A)).toBe(2);
    expect(tokensNamed(game, "3/3 Centaur Token", B)).toBe(1);
    expect(zone(game, ingot)).toBe("battlefield");
    expect(pt(game, named(game, "3/3 Centaur Token", B)[0])).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Awaken the Erstwhile", () => {
  it("each player makes as many Zombies as they discarded", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Awaken the Erstwhile");
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const alice = hand(game, A).length - 1;
    const bob = hand(game, B).length;
    expect(alice).not.toBe(bob);
    cast(game, card);
    expect(hand(game, A).length).toBe(0);
    expect(hand(game, B).length).toBe(0);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(alice);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(bob);
  });
});

describe("Ill-Gotten Inheritance", () => {
  it("drains each opponent for 1 at your upkeep", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Ill-Gotten Inheritance");
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
  });

  it("sacrificed, deals 4 to target opponent and you gain 4", () => {
    const { game } = table();
    const inheritance = spawn(game, "Ill-Gotten Inheritance");
    lands(game, "Swamp", 6);
    activate(game, inheritance, 0, { targets: [ref(B)] });
    expect(zone(game, inheritance)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });
});

describe("Incubation // Incongruity", () => {
  it("Incongruity exiles the creature and its controller gets a Frog Lizard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Incubation // Incongruity"), { face: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Frog Lizard Token", B)).toBe(1);
    expect(tokensNamed(game, "Frog Lizard Token", A)).toBe(0);
  });
});

describe("Bankrupt in Blood", () => {
  it("sacrifices exactly two creatures and draws three", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Swamp", 2);
    const card = toHand(game, "Bankrupt in Blood");
    const before = hand(game, A).length - 1;
    cast(game, card);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("can't be cast with only one creature", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    expect(() => cast(game, toHand(game, "Bankrupt in Blood"))).toThrow();
  });
});

describe("Skatewing Spy", () => {
  it("adapts 2, and only creatures with a +1/+1 counter fly", () => {
    const { game } = table();
    const spy = spawn(game, "Skatewing Spy");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, spy).has("flying")).toBe(false);
    lands(game, "Island", 6);
    activate(game, spy, 0);
    expect(counters(game, spy)).toBe(2);
    expect(keywords(game, spy).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Depose // Deploy", () => {
  it("Deploy makes two Thopters, then gains 1 life per creature you control, the Thopters included", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Depose // Deploy"), { face: 2 });
    expect(tokensNamed(game, "Thopter Token", A)).toBe(2);
    expect(life(game, A)).toBe(23);
  });
});

describe("Dovin's Acuity", () => {
  it("gains 2 and draws as it enters", () => {
    const { game } = table();
    const before = hand(game, A).length;
    enter(game, "Dovin's Acuity");
    expect(life(game, A)).toBe(22);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("may return to hand when you cast an instant in your main phase", () => {
    const { game, a } = table();
    const acuity = spawn(game, "Dovin's Acuity");
    lands(game, "Island", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(zone(game, acuity)).toBe("hand");
  });

  it("doesn't trigger on an instant cast outside your main phase", () => {
    const { game, a } = table();
    const acuity = spawn(game, "Dovin's Acuity");
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    toStep(game, "begin-combat");
    pickModes(a, 0);
    cast(game, opt);
    expect(zone(game, acuity)).toBe("battlefield");
  });
});

describe("Arrester's Admonition", () => {
  it("draws a card when cast in your main phase", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const card = toHand(game, "Arrester's Admonition");
    const before = hand(game, A).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, A).length).toBe(before);
  });

  it("doesn't draw when cast outside your main phase", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const card = toHand(game, "Arrester's Admonition");
    toStep(game, "begin-combat");
    const before = hand(game, A).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 1);
  });
});

describe("Sphinx's Insight", () => {
  it("gains 2 life only when cast in your main phase", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Sphinx's Insight"));
    expect(life(game, A)).toBe(22);
    const second = toHand(game, "Sphinx's Insight");
    toStep(game, "begin-combat");
    cast(game, second);
    expect(life(game, A)).toBe(22);
  });
});

describe("Goblin Gathering", () => {
  it("makes two plus one Goblin per Goblin Gathering in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Goblin Gathering");
    toGraveyard(game, "Goblin Gathering");
    toGraveyard(game, "Goblin Gathering", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Goblin Gathering"));
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
  });
});

describe("Warrant // Warden", () => {
  it("Warden makes a 4/4 Sphinx with flying and vigilance", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Warrant // Warden"), { face: 2 });
    const sphinx = named(game, "Sphinx Token", A)[0];
    expect(pt(game, sphinx)).toEqual({ power: 4, toughness: 4 });
    expect([...keywords(game, sphinx)].sort()).toEqual(["flying", "vigilance"]);
  });
});

describe("Screaming Shield", () => {
  it("gives +0/+3 and a mill-three ability to the equipped creature", () => {
    const { game } = table();
    const shield = spawn(game, "Screaming Shield");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 5);
    activate(game, shield, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
    const before = graveyard(game, B).length;
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 3);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Amplifire", () => {
  it("becomes twice the revealed creature's size until your next turn", () => {
    const { game } = table();
    const amp = spawn(game, "Amplifire");
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, amp)).toEqual({ power: 6, toughness: 6 });
    expect(zone(game, giant)).toBe("library");
  });

  it("becomes 0/0 when no creature card is revealed", () => {
    const { game } = table();
    const amp = spawn(game, "Amplifire");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, amp)).toBe("graveyard");
  });
});

describe("Tenth District Veteran", () => {
  it("untaps another creature you control as it attacks", () => {
    const { game, a } = table();
    const veteran = spawn(game, "Tenth District Veteran");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, bears);
    attack(game, a, [veteran]);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Territorial Boar", () => {
  it("gets +1/+1 and vigilance only when a creature with power 4 or more enters", () => {
    const { game } = table();
    const boar = spawn(game, "Territorial Boar");
    enter(game, "Hill Giant");
    expect(pt(game, boar)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Craw Wurm");
    expect(pt(game, boar)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, boar).has("vigilance")).toBe(true);
  });
});

describe("Sagittars' Volley", () => {
  it("destroys the flier and deals 1 to each flier your opponents control", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const theirBirds = spawn(game, "Birds of Paradise", B);
    const myBirds = spawn(game, "Birds of Paradise", A);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Sagittars' Volley"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, theirBirds)).toBe("graveyard");
    expect(zone(game, myBirds)).toBe("battlefield");
  });
});
