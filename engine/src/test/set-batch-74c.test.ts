/**
 * Marvel Super Heroes Commander (MSC) and Marvel Super Heroes (MSH), batch
 * 74, part c (2026-10-14): the rest of MSC and the start of MSH's rest.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Intrepid Ace", () => {
  it("is 4/1 while not in combat, and 2/1 once it attacks", () => {
    const { game, a } = table();
    const ace = spawn(game, "Intrepid Ace");
    expect(pt(game, ace)).toEqual({ power: 4, toughness: 1 });
    a.declareAttackersFn = () => [{ attacker: ace, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, ace)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Patriot, Young Avenger", () => {
  it("gives other creatures you control +1/+0 only while equipped", () => {
    const { game } = table();
    const patriot = spawn(game, "Patriot, Young Avenger");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    activate(game, spawn(game, "Shuko"), 0, { targets: [ref(patriot)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // Patriot gets Shuko's +1/+0, not his own anthem.
    expect(pt(game, patriot)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Armed Assailant", () => {
  it("gets +2/+0 and menace while equipped", () => {
    const { game } = table();
    const assailant = spawn(game, "Armed Assailant");
    expect(keywords(game, assailant).has("menace")).toBe(false);
    activate(game, spawn(game, "Shuko"), 0, { targets: [ref(assailant)] });
    expect(pt(game, assailant)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, assailant).has("menace")).toBe(true);
  });
});

describe("Count Nefaria", () => {
  it("costs {3} less once you've sacrificed a permanent this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const altar = spawn(game, "Ashnod's Altar");
    const bear = spawn(game, "Grizzly Bears");
    const count = toHand(game, "Count Nefaria");
    expect(castOffers(game, count)).toHaveLength(0);
    // The altar's {C}{C} floats: six mana, short of {6}{B} but not of {3}{B}.
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: bear });
    settle(game);
    expect(castOffers(game, count).length).toBeGreaterThan(0);
    cast(game, count);
    expect(zone(game, count)).toBe("battlefield");
  });
});

describe("Imperial Cosmographer", () => {
  it("grows when another creature you control leaves without dying, not when one dies", () => {
    const { game } = table();
    const cosmo = spawn(game, "Imperial Cosmographer");
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(bear)]);
    settle(game);
    expect(counters(game, cosmo)).toBe(2);
    destroy(game, giant);
    settle(game);
    expect(counters(game, cosmo)).toBe(2);
  });
});

describe("Ant-Man, Colony Commander", () => {
  it("pays {1} to put a counter on a creature, which makes one Insect — only once each turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const antman = spawn(game, "Ant-Man, Colony Commander");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bear);
    attack(game, a, [antman]);
    // An opponent's creature counts: "a creature", not "a creature you control".
    expect(counters(game, bear)).toBe(1);
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(antman)]);
    settle(game);
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
  });

  it("doesn't trigger off counters another player puts", () => {
    const { game } = table();
    spawn(game, "Ant-Man, Colony Commander");
    const bear = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(tokensNamed(game, "Insect Token", A)).toBe(0);
  });
});

describe("Spider-Man, To the Rescue", () => {
  it("taps himself to give another nonattacking creature you control indestructible", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const attacker = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    toStep(game, "declare-blockers");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bear]);
    // Flashed in mid-combat: not himself, not the attacker, not bob's bear.
    const spidey = enter(game, "Spider-Man, To the Rescue");
    expect([...(seen.offered[0] ?? [])].sort()).toEqual([bear, other].sort());
    expect(game.state.objects[spidey].tapped).toBe(true);
    expect(keywords(game, bear).has("indestructible")).toBe(true);
  });

  it("does nothing more when he can't be tapped (already tapped)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bear]);
    game.debugSpawn("Spider-Man, To the Rescue", A, "battlefield", { announceEntry: true, summoningSick: false, tapped: true });
    settle(game);
    expect(seen.asked).toBe(0);
    expect(keywords(game, bear).has("indestructible")).toBe(false);
  });
});

describe("Titanium Man", () => {
  it("can choose to deal 1 damage to any target as it attacks", () => {
    const { game, a } = table();
    const titan = spawn(game, "Titanium Man");
    pickModes(a, 1);
    pickTargets(a, B);
    attack(game, a, [titan]);
    // 3 combat damage, 1 from the trigger.
    expect(life(game, B)).toBe(16);
    expect(keywords(game, titan).has("flying")).toBe(false);
  });
});

describe("Stature, Young Avenger", () => {
  it("has base 4/4 after a noncreature spell, counters on top", () => {
    const { game } = table();
    const stature = spawn(game, "Stature, Young Avenger");
    game.state.objects[stature].counters["+1/+1"] = 1;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, stature)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("White Tiger, Amulet Keeper", () => {
  it("exiles itself from the graveyard to draw and put a land from hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const tiger = toGraveyard(game, "White Tiger, Amulet Keeper");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    const before = hand(game).length;
    activate(game, tiger, 0);
    expect(zone(game, tiger)).toBe("exile");
    expect(zone(game, forest)).toBe("battlefield");
    expect(hand(game)).toHaveLength(before); // drew one, put one down
  });
});

describe("Atlas, Sizable Stooge", () => {
  it("gains 1 life for each creature you control with power 4 or greater as it attacks", () => {
    const { game, a } = table();
    const atlas = spawn(game, "Atlas, Sizable Stooge");
    spawn(game, "Serra Angel");
    spawn(game, "Grizzly Bears");
    spawn(game, "Serra Angel", B);
    attack(game, a, [atlas]);
    expect(life(game, A)).toBe(22);
  });
});

describe("The Howling Commandos", () => {
  it("pumps every creature you control but gives vigilance only to Soldiers", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const commandos = spawn(game, "The Howling Commandos");
    const vanguard = spawn(game, "Elite Vanguard");
    const bear = spawn(game, "Grizzly Bears");
    activate(game, commandos, 0);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("vigilance")).toBe(false);
    expect(keywords(game, vanguard).has("vigilance")).toBe(true);
    expect(keywords(game, commandos).has("vigilance")).toBe(true);
  });
});

describe("I Am Iron Man", () => {
  it("makes an artifact a 4/4 flying artifact creature until end of turn, and draws", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ring = spawn(game, "Sol Ring");
    const before = hand(game).length;
    cast(game, toHand(game, "I Am Iron Man"), { targets: [ref(ring)] });
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, ring).has("flying")).toBe(true);
    expect(hand(game)).toHaveLength(before + 1);
  });
});
