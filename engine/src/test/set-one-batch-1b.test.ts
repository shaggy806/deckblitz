/**
 * Phyrexia: All Will Be One (ONE/ONC), set batch 1, group b (2026-10-17).
 * Written from the Oracle text on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
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
  watchTargets,
  zone,
} from "./harness.js";

describe("Wurmquake", () => {
  it("makes a 6/6 Wurm, and one more for each opponent with three or more poison counters", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].counters.poison = 3;
    game.state.players[C].counters.poison = 2;
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Wurmquake"));
    const wurms = named(game, "Phyrexian Wurm Token", A);
    expect(tokensNamed(game, "Phyrexian Wurm Token", A)).toBe(2);
    for (const wurm of wurms) expect(pt(game, wurm)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, wurms[0]).has("trample")).toBe(true);
  });

  it("is a 10/10 cast with flashback, and alone with no opponent poisoned", () => {
    const { game } = table();
    game.state.players[B].counters.poison = 2;
    lands(game, "Forest", 10);
    cast(game, toGraveyard(game, "Wurmquake"), { via: "flashback" });
    expect(tokensNamed(game, "Phyrexian Wurm Token", A)).toBe(1);
    expect(pt(game, named(game, "Phyrexian Wurm Token", A)[0])).toEqual({ power: 10, toughness: 10 });
  });
});

describe("Argentum Masticore", () => {
  it("discarding keeps it, and destroys an opponent's nonland permanent of no greater mana value", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Argentum Masticore");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const thopter = spawn(game, "Ornithopter", B);
    spawn(game, "Forest", B);
    const discard = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [discard];
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bears, thopter].sort());
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, masticore)).toBe("battlefield");
    expect(graveyard(game)).toContain(discard);
  });

  it("is sacrificed when you don't discard", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Argentum Masticore");
    toHand(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, masticore)).toBe("graveyard");
  });
});

describe("Magmatic Sprinter", () => {
  it("stays by removing two oil counters at your end step, and returns when it can't", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const sprinter = toHand(game, "Magmatic Sprinter");
    pickTargets(a, sprinter);
    cast(game, sprinter);
    expect(counters(game, sprinter, "oil")).toBe(2);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, sprinter)).toBe("battlefield");
    expect(counters(game, sprinter, "oil")).toBe(0);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "end");
    settle(game);
    expect(named(game, "Magmatic Sprinter")).toHaveLength(0);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Magmatic Sprinter")).toBe(true);
  });
});

describe("Ichorplate Golem", () => {
  it("adds an oil counter to a creature that entered with one, and pumps creatures with oil counters by +1/+1 only", () => {
    const { game } = table();
    spawn(game, "Ichorplate Golem");
    const seer = enter(game, "Glistener Seer");
    expect(counters(game, seer, "oil")).toBe(4);
    expect(pt(game, seer)).toEqual({ power: 1, toughness: 4 });
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears, "oil")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const theirs = spawn(game, "Glistener Seer", B);
    game.state.objects[theirs].counters.oil = 1;
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Evolving Adaptive", () => {
  it("grows only when the entering creature has greater power or toughness", () => {
    const { game } = table();
    const adaptive = enter(game, "Evolving Adaptive");
    expect(pt(game, adaptive)).toEqual({ power: 1, toughness: 1 });
    enter(game, "Grizzly Bears");
    expect(counters(game, adaptive, "oil")).toBe(2);
    enter(game, "Grizzly Bears");
    expect(counters(game, adaptive, "oil")).toBe(2);
    enter(game, "Grizzly Bears", B);
    expect(counters(game, adaptive, "oil")).toBe(2);
  });
});

describe("Vindictive Flamestoker", () => {
  it("gets oil from noncreature spells, and its ability costs {1} less per oil counter", () => {
    const { game } = table();
    const stoker = spawn(game, "Vindictive Flamestoker");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, stoker, "oil")).toBe(1);
    game.state.objects[stoker].counters.oil = 4;
    lands(game, "Mountain", 3);
    const kept = toHand(game, "Grizzly Bears");
    activate(game, stoker, 0);
    expect(zone(game, stoker)).toBe("graveyard");
    expect(graveyard(game)).toContain(kept);
    expect(hand(game)).toHaveLength(4);
  });
});

describe("Transplant Theorist", () => {
  it("may loot when it or another artifact you control enters", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Transplant Theorist");
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(1);
    enter(game, "Ornithopter");
    expect(graveyard(game)).toHaveLength(2);
    enter(game, "Grizzly Bears");
    expect(graveyard(game)).toHaveLength(2);
  });
});

describe("Resistance Reunited and Prosthetic Injector", () => {
  it("gives indestructible to the creatures equipped as it resolves, and no others", () => {
    const { game, a } = table();
    const injector = spawn(game, "Prosthetic Injector");
    const armed = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    activate(game, injector, 0, { targets: [ref(armed)] });
    expect(pt(game, armed)).toEqual({ power: 2, toughness: 4 });
    cast(game, toHand(game, "Resistance Reunited"), { targets: [ref(bare)] });
    expect(pt(game, bare)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, armed).has("indestructible")).toBe(true);
    expect(keywords(game, bare).has("indestructible")).toBe(false);
    activate(game, injector, 0, { targets: [ref(bare)] });
    expect(keywords(game, bare).has("indestructible")).toBe(false);
    expect(keywords(game, armed).has("indestructible")).toBe(true);
    attack(game, a, [bare]);
    expect(game.state.players[B].counters.poison).toBe(1);
  });
});

describe("Rebel Salvo", () => {
  it("costs {1} less per Equipment, and the damaged permanent loses indestructible", () => {
    const { game } = table();
    spawn(game, "Prosthetic Injector");
    const myr = spawn(game, "Darksteel Myr", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Rebel Salvo"), { targets: [ref(myr)] });
    expect(zone(game, myr)).toBe("graveyard");
  });
});

describe("Venomous Brutalizer", () => {
  it("proliferates when you pay {1}{G}", () => {
    const { game, a } = table();
    game.state.players[B].counters.poison = 1;
    lands(game, "Forest", 2);
    pickModes(a, 0);
    enter(game, "Venomous Brutalizer");
    expect(game.state.players[B].counters.poison).toBe(2);
  });
});

describe("Monumental Corruption", () => {
  it("has the target player draw and lose X, X your artifacts", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Monumental Corruption"), { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(before + 3);
    expect(life(game, B)).toBe(17);
  });
});

describe("Oil-Gorger Troll", () => {
  it("gains 3, then draws only if you control a permanent with an oil counter", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Oil-Gorger Troll");
    expect(life(game)).toBe(23);
    expect(hand(game)).toHaveLength(before);
    const theirs = spawn(game, "Glistener Seer", B);
    game.state.objects[theirs].counters.oil = 3;
    enter(game, "Oil-Gorger Troll");
    expect(hand(game)).toHaveLength(before);
    const seer = spawn(game, "Glistener Seer");
    game.state.objects[seer].counters.oil = 1;
    enter(game, "Oil-Gorger Troll");
    expect(life(game)).toBe(29);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Exuberant Fuseling", () => {
  it("gets oil as it enters and as another creature or artifact of yours goes to a graveyard", () => {
    const { game } = table();
    const fuseling = enter(game, "Exuberant Fuseling");
    expect(pt(game, fuseling)).toEqual({ power: 1, toughness: 1 });
    destroy(game, spawn(game, "Ornithopter"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(pt(game, fuseling)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Bonepicker Skirge", () => {
  it("has deathtouch and lifelink only while an opponent has three or more poison counters", () => {
    const { game } = table();
    const skirge = spawn(game, "Bonepicker Skirge");
    expect(keywords(game, skirge).has("deathtouch")).toBe(false);
    game.state.players[B].counters.poison = 3;
    expect(keywords(game, skirge).has("deathtouch")).toBe(true);
    expect(keywords(game, skirge).has("lifelink")).toBe(true);
  });
});

describe("Axiom Engraver", () => {
  it("enters with two oil counters; removing one and discarding draws a card", () => {
    const { game, a } = table();
    const entered = enter(game, "Axiom Engraver");
    expect(counters(game, entered, "oil")).toBe(2);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [bolt];
    activate(game, entered, 0);
    expect(counters(game, entered, "oil")).toBe(1);
    expect(graveyard(game)).toContain(bolt);
    expect(hand(game)).toHaveLength(before);
  });
});
