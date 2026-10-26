/**
 * Theros and Commander 2013, group D: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Akroan Hoplite", () => {
  it("counts every attacking creature you control, itself included", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Akroan Hoplite");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: hoplite, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "combat-damage");
    settle(game);
    expect(pt(game, hoplite)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Kragma Warcaller", () => {
  it("gives Minotaurs haste and +2/+0 as they attack", () => {
    const { game, a } = table();
    const kragma = spawn(game, "Kragma Warcaller", A, { sick: true });
    expect(keywords(game, kragma).has("haste")).toBe(true);
    const before = game.state.players[B].life;
    attack(game, a, [kragma]);
    expect(game.state.players[B].life).toBe(before - 4);
  });
});

describe("Favored Hoplite", () => {
  it("heroic puts a counter on it and prevents all damage to it this turn", () => {
    const { game } = table();
    const hoplite = spawn(game, "Favored Hoplite");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hoplite)] });
    expect(counters(game, hoplite)).toBe(1);
    game.debugApplyEffect(B, { kind: "damage", amount: 10, target: 0 }, [ref(hoplite)]);
    settle(game);
    expect(zone(game, hoplite)).toBe("battlefield");
  });
});

describe("Tidal Force", () => {
  it("taps a permanent at the beginning of an opponent's upkeep", () => {
    const { game, a } = table();
    spawn(game, "Tidal Force");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Warriors' Lesson", () => {
  it("the creature draws a card when it deals combat damage to a player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Warriors' Lesson"), { targets: [ref(bears)] });
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Witches' Eye", () => {
  it("gives the equipped creature {1}, {T}: Scry 1", () => {
    const { game } = table();
    const eye = spawn(game, "Witches' Eye");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, eye, 0, { targets: [ref(bears)] });
    activate(game, bears, 0);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Triad of Fates", () => {
  it("puts a fate counter, then exiles that creature and its controller draws two", () => {
    const { game } = table();
    const triad = spawn(game, "Triad of Fates");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    lands(game, "Swamp", 1);
    activate(game, triad, 0, { targets: [ref(bears)] });
    expect(counters(game, bears, "fate")).toBe(1);
    game.state.objects[triad].tapped = false;
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, triad, 2, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B).length).toBe(theirs + 2);
    expect(hand(game, A).length).toBe(mine);
  });

  it("can't target a creature without a fate counter", () => {
    const { game } = table();
    const triad = spawn(game, "Triad of Fates");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    expect(() => activate(game, triad, 1, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Shipbreaker Kraken", () => {
  it("taps up to four creatures that stay tapped while you control it", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Shipbreaker Kraken");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    lands(game, "Island", 8);
    pickTargets(a, one, two);
    activate(game, kraken, 0);
    expect(counters(game, kraken)).toBe(4);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
  });
});

describe("Polukranos, World Eater", () => {
  it("divides X among the targets, then each deals its power to Polukranos", () => {
    const { game } = table();
    const polukranos = spawn(game, "Polukranos, World Eater");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 5);
    activate(game, polukranos, 0, { x: 2, settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || quiet(s));
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.divide).toMatchObject({ total: 2, slot: 0 });
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(giant)], division: [1, 1] });
    settle(game);
    expect(counters(game, polukranos)).toBe(2);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(game.state.objects[polukranos].damageMarked).toBe(5);
    expect(zone(game, polukranos)).toBe("battlefield");
  });
});
