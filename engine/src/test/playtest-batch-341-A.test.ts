/**
 * Playtest batch 341, group A: one focused test per card whose behaviour is
 * more than a stat line or a copy of an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Koma and Toski, Compleated", () => {
  it("makes Toski's Coil each upkeep, and sacrifices only another Serpent or Squirrel", () => {
    const { game } = table();
    const koma = spawn(game, "Koma and Toski, Compleated");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "upkeep", B);
    settle(game);
    expect(tokensNamed(game, "Toski's Coil", A)).toBe(1);
    toStep(game, "precombat-main");
    const coil = named(game, "Toski's Coil", A)[0];
    expect(types(game, coil)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(() => activate(game, koma, 0, { modes: [1], sacrifice: bears })).toThrow(/refused/);
    activate(game, koma, 0, { modes: [1], sacrifice: coil });
    expect(keywords(game, koma).has("indestructible")).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("The Ice Dancer", () => {
  it("makes a Gold token, then draws, gains and deals X for the artifact tokens", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    const dancer = spawn(game, "The Ice Dancer");
    const before = hand(game, A).length;
    attack(game, a, [dancer]);
    expect(tokensNamed(game, "Gold Token", A)).toBe(1);
    expect(hand(game, A).length - before).toBe(2);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20 - 2 - 2);
  });
});

describe("Bob the Claymore", () => {
  it("gives each creature blocking the equipped creature -5/-5", () => {
    const { game, a, b } = table();
    const bob = spawn(game, "Bob the Claymore");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, bob, 0, { targets: [ref(bears)] });
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Eldest Dragon Highlander", () => {
  it("pumps Elder Dragons only", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    const eldest = spawn(game, "Eldest Dragon Highlander");
    const shivan = spawn(game, "Shivan Dragon");
    activate(game, eldest, 0);
    expect(pt(game, eldest)).toEqual({ power: 14, toughness: 14 });
    expect(pt(game, shivan)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Avacyn and Griselbrand", () => {
  it("pays 8 life: indestructible for each creature you control, then a card for each", () => {
    const { game } = table();
    const avacyn = spawn(game, "Avacyn and Griselbrand");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    activate(game, avacyn, 0);
    expect(life(game, A)).toBe(12);
    expect(hand(game, A).length - before).toBe(2);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Elemental, My Dear", () => {
  it("investigates X times, then the 0/0 Elemental gets a counter for each Clue", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 }, []);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Elemental, My Dear"), { x: 2 });
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    const elemental = named(game, "0/0 Blue Elemental Token", A)[0];
    expect(pt(game, elemental)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Math is for Blockers", () => {
  it("gives your creatures double strike and trample", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Math is for Blockers"));
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, giant).has("double-strike")).toBe(false);
  });
});

describe("Goblin Savant", () => {
  it("may play the exiled card only if it's a Goblin or an artifact card", () => {
    const { game } = table();
    const first = spawn(game, "Goblin Savant");
    const second = spawn(game, "Goblin Savant");
    const bears = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    lands(game, "Forest", 3);
    activate(game, first, 0);
    activate(game, second, 0);
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" })).not.toBeNull();
    cast(game, ring, { via: "impulse" });
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Noxious Bayou", () => {
  it("gives you a poison counter when tapped for mana", () => {
    const { game } = table();
    spawn(game, "Noxious Bayou");
    cast(game, toHand(game, "Dark Ritual"));
    expect(game.state.players[A].counters.poison).toBe(1);
  });
});

describe("Graveyard Dig", () => {
  it("returns only black or green creature cards, unless cast for its other cost", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const lions = toGraveyard(game, "Savannah Lions");
    const bears = toGraveyard(game, "Grizzly Bears");
    const dig = toHand(game, "Graveyard Dig");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: dig, targets: [ref(lions), null] })).not.toBeNull();
    cast(game, dig, { targets: [ref(lions), ref(bears)], overload: true });
    expect(zone(game, lions)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Rin and Seri, Inseparabler", () => {
  it("makes Cats Dogs, with haste", () => {
    const { game } = table();
    spawn(game, "Rin and Seri, Inseparabler");
    const lions = spawn(game, "Savannah Lions", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    expect(subtypes(game, lions)).toEqual(expect.arrayContaining(["Cat", "Dog"]));
    expect(keywords(game, lions).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});

describe("New Master of Arms", () => {
  it("taps its blocker, whose combat damage is then prevented", () => {
    const { game, a, b } = table();
    const master = spawn(game, "New Master of Arms");
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: master, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: master }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, master, 0, { targets: [ref(giant)] });
    toStep(game, "postcombat-main");
    expect(zone(game, master)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Norin and Feldon", () => {
  it("copies a graveyard creature as a hasty artifact, exiled when a player casts a spell", () => {
    const { game } = table();
    const norin = spawn(game, "Norin and Feldon");
    lands(game, "Mountain", 5);
    toGraveyard(game, "Grizzly Bears");
    const card = game.state.zones.perPlayer[A].graveyard[0];
    activate(game, norin, 0, { targets: [ref(card)] });
    const token = named(game, "Grizzly Bears", A)[0];
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, token).has("haste")).toBe(true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Cinnamon, Seasoned Steed", () => {
  it("makes a noncreature Food a 0/0 Knight creature with a +1/+1 counter at your combat", () => {
    const { game, a } = table();
    spawn(game, "Cinnamon, Seasoned Steed");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    const food = named(game, "Food Token", A)[0];
    pickTargets(a, food);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, food)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, food)).toEqual(expect.arrayContaining(["Food", "Knight"]));
    expect(pt(game, food)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, food).has("horsemanship")).toBe(true);
  });
});

describe("The Covert Blue Mage", () => {
  it("makes Covert Sunglasses", () => {
    const { game } = table();
    enter(game, "The Covert Blue Mage");
    expect(tokensNamed(game, "Covert Sunglasses", A)).toBe(1);
  });
});

describe("The Bus Runner", () => {
  it("makes a Desert Vehicle with eight hour counters, which drains when the last is removed", () => {
    const { game, a } = table();
    const runner = enter(game, "The Bus Runner");
    const vehicle = named(game, "Desert Vehicle Token", A)[0];
    expect(counters(game, vehicle, "hour")).toBe(8);
    expect(types(game, vehicle)).toEqual(expect.arrayContaining(["artifact", "land"]));
    game.state.objects[vehicle].counters.hour = 1;
    attack(game, a, [runner]);
    expect(counters(game, vehicle, "hour")).toBe(8);
    expect(life(game, B)).toBe(20 - 3 - 1);
    expect(life(game, A)).toBe(21);
  });
});

describe("Recycla-bird", () => {
  it("puts a flying counter on a creature you control as it dies", () => {
    const { game, a } = table();
    const bird = spawn(game, "Recycla-bird");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    destroy(game, bird);
    settle(game);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});
