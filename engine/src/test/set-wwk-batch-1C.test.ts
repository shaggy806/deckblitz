/**
 * Worldwake (WWK; B162), group C. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
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

describe("Quest for Ula's Temple", () => {
  it("reveals a creature on top for a quest counter, and leaves the card on top", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for Ula's Temple");
    const bear = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bear);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, quest, "quest")).toBe(1);
    expect(zone(game, bear)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bear);
  });

  it("puts no counter when the player keeps the creature hidden", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for Ula's Temple");
    toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, quest, "quest")).toBe(0);
  });

  it("with three quest counters, puts a sea monster from hand onto the battlefield at an end step", () => {
    const { game, a } = table();
    const quest = spawn(game, "Quest for Ula's Temple");
    game.state.objects[quest].counters.quest = 3;
    const kraken = toHand(game, "Spawning Kraken");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, kraken);
    toStep(game, "end");
    settle(game);
    expect(seen.offered).toEqual([kraken]);
    expect(zone(game, kraken)).toBe("battlefield");
  });
});

describe("Urge to Feed", () => {
  it("shrinks the target, then taps the chosen Vampires and grows each", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const one = spawn(game, "Vampire Nighthawk");
    const two = spawn(game, "Vampire Nighthawk");
    const seen = pickPermanents(a, one);
    cast(game, toHand(game, "Urge to Feed"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(seen.offered).toEqual(expect.arrayContaining([one, two]));
    expect(game.state.objects[one].tapped).toBe(true);
    expect(counters(game, one)).toBe(1);
    expect(game.state.objects[two].tapped).toBe(false);
    expect(counters(game, two)).toBe(0);
  });
});

describe("Agadeem Occultist", () => {
  it("reanimates an opponent's creature card only if its mana value is at most your Allies", () => {
    const { game } = table();
    const occultist = spawn(game, "Agadeem Occultist");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    spawn(game, "Graypelt Hunter");
    game.dispatch({ type: "activate-ability", player: A, source: occultist, abilityIndex: 0, targets: [ref(giant)] });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    nextTurn(game);
    nextTurn(game);
    game.dispatch({ type: "activate-ability", player: A, source: occultist, abilityIndex: 0, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Graypelt Hunter", () => {
  it("may take a counter as it enters and as another Ally enters", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const hunter = enter(game, "Graypelt Hunter");
    expect(counters(game, hunter)).toBe(1);
    enter(game, "Agadeem Occultist");
    expect(counters(game, hunter)).toBe(2);
    pickModes(a);
    enter(game, "Agadeem Occultist");
    expect(counters(game, hunter)).toBe(2);
  });
});

describe("Hammer of Ruin", () => {
  it("may destroy an Equipment the damaged player controls", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const hammer = spawn(game, "Hammer of Ruin");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Bonesplitter", B);
    game.dispatch({ type: "activate-ability", player: A, source: hammer, abilityIndex: 0, targets: [ref(bears)] });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    pickTargets(a, theirs);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(16);
  });
});

describe("Slavering Nulls", () => {
  it("may make the damaged player discard, only while you control a Swamp", () => {
    const { game, a } = table();
    const nulls = spawn(game, "Slavering Nulls");
    toHand(game, "Grizzly Bears", B);
    pickModes(a, 0);
    const before = hand(game, B).length;
    attack(game, a, [nulls]);
    expect(hand(game, B).length).toBe(before);
    spawn(game, "Swamp");
    nextTurn(game);
    nextTurn(game);
    const later = hand(game, B).length;
    attack(game, a, [nulls]);
    expect(hand(game, B).length).toBe(later - 1);
  });
});

describe("Slingbow Trap", () => {
  it("costs {G} while a black flyer is attacking, even your own", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const hawk = spawn(game, "Vampire Nighthawk");
    a.declareAttackersFn = () => [{ attacker: hawk, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Slingbow Trap"), { targets: [ref(hawk)], altCost: true });
    expect(zone(game, hawk)).toBe("graveyard");
  });

  it("can't be cast for {G} when only a nonblack flyer attacks", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const drake = spawn(game, "Wind Drake");
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    expect(() => cast(game, toHand(game, "Slingbow Trap"), { targets: [ref(drake)], altCost: true, settle: false })).toThrow();
  });
});

describe("Skitter of Lizards", () => {
  it("enters with a counter per kick", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Skitter of Lizards"), { kicked: true, kickCount: 2 });
    const [lizards] = named(game, "Skitter of Lizards");
    expect(pt(game, lizards)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Claws of Valakut", () => {
  it("gives +1/+0 per Mountain and first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Claws of Valakut"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Tideforce Elemental", () => {
  it("taps another creature, then untaps on landfall", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const elemental = spawn(game, "Tideforce Elemental");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.dispatch({ type: "activate-ability", player: A, source: elemental, abilityIndex: 0, targets: [ref(theirs)] });
    settle(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[elemental].tapped).toBe(true);
    enter(game, "Island");
    expect(game.state.objects[elemental].tapped).toBe(false);
  });
});

describe("Kitesail Apprentice", () => {
  it("is a 2/2 flyer while equipped", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const kor = spawn(game, "Kitesail Apprentice");
    expect(keywords(game, kor).has("flying")).toBe(false);
    const splitter = spawn(game, "Bonesplitter");
    game.dispatch({ type: "activate-ability", player: A, source: splitter, abilityIndex: 0, targets: [ref(kor)] });
    settle(game);
    expect(pt(game, kor)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, kor).has("flying")).toBe(true);
    expect(graveyard(game).length).toBe(0);
  });
});
