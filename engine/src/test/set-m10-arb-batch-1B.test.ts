/**
 * Magic 2010 and Alara Reborn (M10, ARB; B168), group B. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Aven Mimeomancer", () => {
  it("makes the target a 3/1 flier for as long as it has a feather counter", () => {
    const { game, a } = table();
    spawn(game, "Aven Mimeomancer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears, "feather")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "feather", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("does nothing when its controller declines", () => {
    const { game, a } = table();
    spawn(game, "Aven Mimeomancer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears, "feather")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Predatory Advantage", () => {
  it("makes a Lizard at the end step of an opponent who cast no creature spell", () => {
    const { game } = table();
    spawn(game, "Predatory Advantage");
    nextTurn(game);
    nextTurn(game);
    expect(tokensNamed(game, "2/2 Green Lizard Token", A)).toBe(1);
  });

  it("makes none at the end step of an opponent who cast a creature spell, only at the next one's", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Predatory Advantage");
    nextTurn(game); // bob's turn
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    nextTurn(game); // carol's turn: bob's end step made nothing
    expect(tokensNamed(game, "2/2 Green Lizard Token", A)).toBe(0);
    nextTurn(game); // carol cast nothing: a Lizard at her end step
    expect(tokensNamed(game, "2/2 Green Lizard Token", A)).toBe(1);
  });
});

describe("Demonspine Whip", () => {
  it("gives the equipped creature +X/+0", () => {
    const { game } = table();
    const whip = spawn(game, "Demonspine Whip");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 4);
    activate(game, whip, 1, { targets: [ref(bears)] });
    activate(game, whip, 0, { x: 3 });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Flurry of Wings", () => {
  it("makes a Bird Soldier for each attacking creature", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Flurry of Wings"));
    expect(tokensNamed(game, "Bird Soldier Token", A)).toBe(2);
  });
});

describe("Stun Sniper", () => {
  it("deals 1 damage to the creature and taps it", () => {
    const { game } = table();
    const sniper = spawn(game, "Stun Sniper");
    const golem = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 1);
    activate(game, sniper, 0, { targets: [ref(golem)] });
    expect(game.state.objects[golem].tapped).toBe(true);
    expect(game.state.objects[golem].damageMarked).toBe(1);
  });
});

describe("Mycoid Shepherd", () => {
  it("may gain 5 life when another creature you control with power 5 or more dies, not a smaller one", () => {
    const { game, a } = table();
    spawn(game, "Mycoid Shepherd");
    const big = spawn(game, "Craw Wurm");
    const small = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, small);
    expect(life(game)).toBe(20);
    destroy(game, big);
    expect(life(game)).toBe(25);
  });
});

describe("Deathbringer Thoctar", () => {
  it("grows when another creature dies and pings with the counter", () => {
    const { game, a } = table();
    const thoctar = spawn(game, "Deathbringer Thoctar");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    destroy(game, bears);
    expect(counters(game, thoctar)).toBe(1);
    activate(game, thoctar, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(counters(game, thoctar)).toBe(0);
    expect(zone(game, thoctar)).toBe("battlefield");
  });
});

describe("Gloryscale Viashino", () => {
  it("gets +3/+3 when you cast a multicolored spell", () => {
    const { game } = table();
    const viashino = spawn(game, "Gloryscale Viashino");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Flurry of Wings"));
    expect(pt(game, viashino)).toEqual({ power: 6, toughness: 6 });
  });
});
