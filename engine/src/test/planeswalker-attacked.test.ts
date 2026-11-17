/**
 * The `planeswalker-attacked` trigger: "whenever an opponent attacks a
 * planeswalker you control with one or more creatures" (Oath of Kaya) — once
 * for each planeswalker attacked (rule 508.3b; the card's ruling), off the
 * `planeswalker-attacked` event, with the attacking player as "that player".
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, life, nextTurn, settle, spawn, table, toStep } from "./harness.js";

describe("Oath of Kaya", () => {
  it("triggers once for each planeswalker attacked, damaging the attacker", () => {
    const { game, b } = table();
    spawn(game, "Oath of Kaya");
    const ob = spawn(game, "Ob Nixilis of the Black Oath");
    const chandra = spawn(game, "Chandra, Acolyte of Flame");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const lions = spawn(game, "Savannah Lions", B);
    nextTurn(game);
    const [lifeA, lifeB] = [life(game, A), life(game, B)];
    b.declareAttackersFn = () => [
      { attacker: bears, defender: ob },
      { attacker: elves, defender: chandra },
      { attacker: lions, defender: A },
    ];
    toStep(game, "declare-blockers", B);
    settle(game);
    expect(life(game, B)).toBe(lifeB - 4);
    expect(life(game, A)).toBe(lifeA + 4);
  });

  it("two creatures attacking one planeswalker trigger it once", () => {
    const { game, b } = table();
    spawn(game, "Oath of Kaya");
    const ob = spawn(game, "Ob Nixilis of the Black Oath");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    nextTurn(game);
    const lifeB = life(game, B);
    b.declareAttackersFn = () => [
      { attacker: bears, defender: ob },
      { attacker: elves, defender: ob },
    ];
    toStep(game, "declare-blockers", B);
    settle(game);
    expect(life(game, B)).toBe(lifeB - 2);
  });

  it("an attack on you, the player, doesn't trigger it", () => {
    const { game, b } = table();
    spawn(game, "Oath of Kaya");
    spawn(game, "Ob Nixilis of the Black Oath");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const lifeB = life(game, B);
    attack(game, b, [bears], A);
    expect(life(game, B)).toBe(lifeB);
  });

  it("your own attack on an opponent's planeswalker doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Oath of Kaya");
    const ob = spawn(game, "Ob Nixilis of the Black Oath", B);
    const bears = spawn(game, "Grizzly Bears");
    const lifeA = life(game, A);
    a.declareAttackersFn = () => [{ attacker: bears, defender: ob }];
    toStep(game, "declare-blockers", A);
    settle(game);
    expect(life(game, A)).toBe(lifeA);
  });
});
