import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
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
  zone,
} from "./harness.js";

// Dragons of Tarkir, group D.

const faceDown = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });
const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};
const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Foul-Tongue Shriek", () => {
  it("drains 1 for each attacking creature you control", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    a.declareAttackersFn = () => [lions, bears].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Foul-Tongue Shriek"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Silumgar Assassin", () => {
  it("can't be blocked by a creature with greater power, and destroys a small creature as it turns up", () => {
    const { game, a } = table();
    const assassin = spawn(game, "Silumgar Assassin");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [assassin]);
    expect(canBlock(offer, giant)).toEqual([]);
    expect(canBlock(offer, bears)).toEqual([assassin]);

    const t = table();
    const card = toHand(t.game, "Silumgar Assassin");
    const theirs = spawn(t.game, "Hill Giant", B);
    lands(t.game, "Swamp", 6);
    faceDown(t.game, card);
    pickTargets(t.a, theirs);
    turnUp(t.game, card);
    expect(zone(t.game, theirs)).toBe("graveyard");
    expect(counters(t.game, card)).toBe(1);
  });
});

describe("Servant of the Scale", () => {
  it("enters with a counter and passes on every +1/+1 counter it had as it died", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const servant = toHand(game, "Servant of the Scale");
    cast(game, servant);
    expect(counters(game, servant)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(servant)]);
    settle(game);
    pickTargets(a, bears);
    destroy(game, servant);
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Dragon-Scarred Bear and Atarka Beastbreaker", () => {
  it("activate only with total power 8 or greater", () => {
    const { game } = table();
    const bear = spawn(game, "Dragon-Scarred Bear");
    const breaker = spawn(game, "Atarka Beastbreaker");
    lands(game, "Forest", 7);
    expect(() => activate(game, breaker)).toThrow();
    expect(() => activate(game, bear)).toThrow();
    spawn(game, "Hill Giant");
    activate(game, breaker);
    expect(pt(game, breaker)).toEqual({ power: 6, toughness: 6 });
    activate(game, bear);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Arashin Foremost", () => {
  it("gives another Warrior double strike as it attacks", () => {
    const { game, a } = table();
    const foremost = spawn(game, "Arashin Foremost");
    const herald = spawn(game, "Herald of Dromoka");
    pickTargets(a, herald);
    attack(game, a, [foremost]);
    expect(keywords(game, herald).has("double-strike")).toBe(true);
  });
});

describe("Herald of Dromoka", () => {
  it("gives other Warriors vigilance, not other creatures", () => {
    const { game } = table();
    spawn(game, "Herald of Dromoka");
    const warrior = spawn(game, "Atarka Beastbreaker");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, warrior).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });
});

describe("Blood-Chin Fanatic", () => {
  it("drains the sacrificed Warrior's last power, counters included", () => {
    const { game } = table();
    const fanatic = spawn(game, "Blood-Chin Fanatic");
    const warrior = spawn(game, "Atarka Beastbreaker");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(warrior)]);
    settle(game);
    lands(game, "Swamp", 2);
    game.dispatch({ type: "activate-ability", player: A, source: fanatic, abilityIndex: 0, targets: [ref(B)], sacrifice: warrior });
    settle(game);
    expect(zone(game, warrior)).toBe("graveyard");
    expect(zone(game, fanatic)).toBe("battlefield");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });
});

describe("Belltoll Dragon", () => {
  it("puts a counter on each other Dragon as it turns up", () => {
    const { game } = table();
    const shivan = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Belltoll Dragon");
    lands(game, "Island", 10);
    faceDown(game, card);
    turnUp(game, card);
    expect(counters(game, shivan)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, card)).toBe(1);
  });
});

describe("Guardian Shield-Bearer", () => {
  it("puts a counter on another creature you control as it turns up", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Guardian Shield-Bearer");
    lands(game, "Forest", 7);
    faceDown(game, card);
    pickTargets(a, bears);
    turnUp(game, card);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, card)).toBe(1);
  });
});

describe("Silumgar Spell-Eater", () => {
  it("counters a spell whose controller doesn't pay {3}", () => {
    const { game, a } = table();
    const card = toHand(game, "Silumgar Spell-Eater");
    lands(game, "Island", 8);
    lands(game, "Forest", 1);
    faceDown(game, card);
    const growth = toHand(game, "Giant Growth");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, growth, { targets: [ref(bears)], settle: false });
    pickTargets(a, growth);
    turnUp(game, card);
    expect(zone(game, growth)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Monastery Loremaster", () => {
  it("returns a noncreature, nonland card as it turns up", () => {
    const { game, a } = table();
    const card = toHand(game, "Monastery Loremaster");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 9);
    faceDown(game, card);
    pickTargets(a, bolt);
    turnUp(game, card);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Gurmag Drowner", () => {
  it("looks at four when it exploits: one to hand, the rest to the graveyard", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const top = [toLibrary(game, "Memnite"), toLibrary(game, "Memnite"), toLibrary(game, "Memnite"), toLibrary(game, "Lightning Bolt")];
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    pickFromZone(a, top[3]);
    const before = graveyard(game).length;
    enter(game, "Gurmag Drowner");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, top[3])).toBe("hand");
    expect(top.slice(0, 3).every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(graveyard(game).length).toBe(before + 4);
  });
});

describe("Kolaghan Aspirant", () => {
  it("deals 1 damage to each creature blocking it", () => {
    const { game, a, b } = table();
    const aspirant = spawn(game, "Kolaghan Aspirant");
    const elves = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: elves, attacker: aspirant }];
    a.declareAttackersFn = () => [{ attacker: aspirant, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Deadly Wanderings", () => {
  it("pumps your only creature, and nothing once you control two", () => {
    const { game } = table();
    spawn(game, "Deadly Wanderings");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });
});

describe("Dance of the Skywise", () => {
  it("makes a blue 4/4 Dragon Illusion with flying and no other abilities", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Dance of the Skywise"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, angel).has("flying")).toBe(true);
    expect(keywords(game, angel).has("vigilance")).toBe(false);
    expect([...subtypes(game, angel)].sort()).toEqual(["Dragon", "Illusion"]);
  });
});

describe("Radiant Purge", () => {
  it("exiles a multicolored creature, and can't target a monocolored one", () => {
    const { game } = table();
    const guildmage = spawn(game, "Boros Guildmage", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    expect(() => cast(game, toHand(game, "Radiant Purge"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Radiant Purge"), { targets: [ref(guildmage)] });
    expect(zone(game, guildmage)).toBe("exile");
  });
});

describe("Swift Warkite", () => {
  it("puts a small creature from hand or graveyard onto the battlefield with haste, and returns it at end step", () => {
    const { game, a } = table();
    const lions = toGraveyard(game, "Savannah Lions");
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    pickModes(a, 0);
    const seen = pickFromZone(a, lions);
    enter(game, "Swift Warkite");
    expect([...seen.offered].sort()).toEqual([lions, bears].sort());
    expect(zone(game, lions)).toBe("battlefield");
    expect(keywords(game, lions).has("haste")).toBe(true);
    expect(zone(game, bears)).toBe("hand");
    nextTurn(game);
    expect(zone(game, lions)).toBe("hand");
    expect(hand(game)).toContain(lions);
  });
});
