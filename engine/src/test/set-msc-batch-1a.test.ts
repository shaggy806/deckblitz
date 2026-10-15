/**
 * Marvel Super Heroes Commander (MSC), batch 1, part a (2026-10-14): the
 * bottom half of the set. Written on the shared table in `harness.ts`.
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  subtypes,
  zone,
} from "./harness.js";

describe("Citizen V, Helmut Zemo", () => {
  it("puts a +1/+1 counter on each Villain you control whenever you gain life", () => {
    const { game } = table();
    const zemo = spawn(game, "Citizen V, Helmut Zemo");
    const mine = spawn(game, "Villain Token");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Villain Token", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(counters(game, zemo)).toBe(1);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, bear)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Stick, Fearless Mentor", () => {
  it("exiles the top card when a source you control deals damage to you, only once each turn", () => {
    const { game } = table();
    spawn(game, "Stick, Fearless Mentor");
    lands(game, "Mountain", 2);
    const exiled = () => game.state.zones.shared.exile.length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game)).toBe(17);
    expect(exiled()).toBe(1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game)).toBe(14);
    expect(exiled()).toBe(1);
  });

  it("doesn't trigger on damage to an opponent", () => {
    const { game } = table();
    spawn(game, "Stick, Fearless Mentor");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Impossible Man", () => {
  it("becomes a copy of another permanent until end of turn, keeping his name", () => {
    const { game } = table();
    const man = spawn(game, "Impossible Man");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 3);
    activate(game, man, 0, { targets: [ref(angel)] });
    expect(game.state.objects[man].cardName).toBe("Impossible Man");
    expect(pt(game, man)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, man).has("vigilance")).toBe(true);
    expect(subtypes(game, man)).toEqual(["Angel"]);
    game.advanceUntil((s) => s.turn.number === 2);
    settle(game);
    expect(pt(game, man)).toEqual({ power: 1, toughness: 4 });
    expect(keywords(game, man).has("vigilance")).toBe(false);
  });
});

describe("Black Tom Cassidy", () => {
  it("adds {G}, and gains 1 life only while you control another Mutant", () => {
    const { game } = table();
    const tom = spawn(game, "Black Tom Cassidy");
    activate(game, tom, 0);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G"]);
    expect(life(game)).toBe(20);
    game.state.objects[tom].tapped = false;
    spawn(game, "Elvish Aberration");
    activate(game, tom, 0);
    expect(life(game)).toBe(21);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});

describe("Nick Fury, Spymaster", () => {
  it("draws, then puts a small creature from the hand onto the battlefield tapped, attacking and indestructible", () => {
    const { game, a } = table();
    spawn(game, "Nick Fury, Spymaster");
    const bear = spawn(game, "Grizzly Bears");
    const lions = toHand(game, "Savannah Lions");
    const angel = toHand(game, "Serra Angel");
    const before = hand(game).length;
    const seen = pickFromZone(a, lions);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    settle(game);
    expect(seen.offered).toContain(lions);
    expect(seen.offered).not.toContain(angel);
    expect(zone(game, lions)).toBe("battlefield");
    expect(game.state.objects[lions].tapped).toBe(true);
    expect(keywords(game, lions).has("indestructible")).toBe(true);
    // Drew one, put one onto the battlefield.
    expect(hand(game)).toHaveLength(before);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // The bear and the lions, both attacking.
    expect(life(game, B)).toBe(16);
  });

  it("doesn't trigger when two creatures attack", () => {
    const { game, a } = table();
    spawn(game, "Nick Fury, Spymaster");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bear, other]);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Falcon, Joaquin Torres", () => {
  it("battalion: a counter and a scry only when he and at least two others attack", () => {
    const { game, a } = table();
    const falcon = spawn(game, "Falcon, Joaquin Torres");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [falcon, bears[0]]);
    expect(counters(game, falcon)).toBe(0);

    const { game: g2, a: a2 } = table();
    const falcon2 = spawn(g2, "Falcon, Joaquin Torres");
    const more = [spawn(g2, "Grizzly Bears"), spawn(g2, "Grizzly Bears")];
    attack(g2, a2, [falcon2, ...more]);
    expect(counters(g2, falcon2)).toBe(1);
  });
});

describe("Ultimate Nullification", () => {
  it("sacrifices a legendary creature, exiles all creatures and graveyards, then goes to the bottom of its owner's library", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const boomerang = spawn(game, "Boomerang, Blade Flinger");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    const buried = toGraveyard(game, "Lightning Bolt", B);
    const relic = spawn(game, "Sol Ring");
    pickPermanents(a, boomerang);
    const spell = toHand(game, "Ultimate Nullification");
    cast(game, spell);
    expect(zone(game, boomerang)).toBe("exile");
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, buried)).toBe("exile");
    expect(zone(game, relic)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(0);
    expect(zone(game, spell)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(spell);
  });

  it("can't be cast without a legendary creature to sacrifice", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Ultimate Nullification");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === spell)).toBe(false);
  });
});

describe("Voltaic Whip", () => {
  it("gives +2/+0, and the equipped creature attacking alone draws a card and loses 1 life", () => {
    const { game, a } = table();
    const whip = spawn(game, "Voltaic Whip");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    activate(game, whip, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    const before = hand(game).length;
    attack(game, a, [bear]);
    expect(hand(game)).toHaveLength(before + 1);
    expect(life(game)).toBe(19);
    expect(life(game, B)).toBe(16);
  });
});

describe("Minotaur, Roxxon CEO", () => {
  it("makes a Villain when any nontoken creature dies, itself included, but not a token", () => {
    const { game } = table();
    const minotaur = spawn(game, "Minotaur, Roxxon CEO");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(tokensNamed(game, "Villain Token", A)).toBe(1);
    destroy(game, named(game, "Villain Token", A)[0]);
    expect(tokensNamed(game, "Villain Token", A)).toBe(0);
    destroy(game, minotaur);
    expect(tokensNamed(game, "Villain Token", A)).toBe(1);
  });
});

describe("Chase Stein, Runaway", () => {
  it("discards a card as a cost to exile the top card of the library", () => {
    const { game } = table();
    const chase = spawn(game, "Chase Stein, Runaway");
    // An empty hand: nothing to discard, so the ability can't be activated.
    const opening = [...hand(game)];
    for (const id of opening) game.debugApplyEffect(A, { kind: "put-on-library", target: 0, position: "bottom" }, [ref(id)]);
    expect(hand(game)).toHaveLength(0);
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === chase)).toBe(false);
    const fodder = toHand(game, "Grizzly Bears");
    activate(game, chase, 0);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(game.state.objects[chase].tapped).toBe(true);
    expect(game.state.zones.shared.exile).toHaveLength(1);
  });
});

describe("Iron Suitcase", () => {
  it("becomes a 3/3 flying Construct artifact creature until end of turn", () => {
    const { game } = table();
    const suitcase = spawn(game, "Iron Suitcase");
    lands(game, "Wastes", 3);
    activate(game, suitcase, 0);
    expect(types(game, suitcase)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, suitcase)).toEqual(["Construct"]);
    expect(pt(game, suitcase)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, suitcase).has("flying")).toBe(true);
  });
});

describe("Living Lies of Loki", () => {
  it("gets +1/+0 for each other Illusion you control", () => {
    const { game } = table();
    const lies = spawn(game, "Living Lies of Loki");
    expect(pt(game, lies)).toEqual({ power: 1, toughness: 3 });
    spawn(game, "Living Lies of Loki");
    spawn(game, "Living Lies of Loki", B);
    expect(pt(game, lies)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Sif's Spearmaster", () => {
  it("deals damage equal to its power to target opponent", () => {
    const { game } = table();
    const spear = spawn(game, "Sif's Spearmaster");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(spear)]);
    activate(game, spear, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Origin of the Hulk", () => {
  it("makes a Citizen, then two counters, then +3/+3 and trample", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    enter(game, "Origin of the Hulk");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    settle(game);
    expect(counters(game, bear)).toBe(2);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "precombat-main");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, bear).has("trample")).toBe(true);
  });
});
