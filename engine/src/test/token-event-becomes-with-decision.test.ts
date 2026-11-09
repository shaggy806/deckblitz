/**
 * A `would-create-token` `becomes` with a choice inside it: the tokens its own
 * effect makes aren't a new event for it to replace (rule 614.5), however deep
 * they sit — Esix, Fractal Bloom.
 */

import { describe, expect, it } from "vitest";

import { A, B, named, pickModes, pickPermanents, settle, spawn, table, tokensNamed } from "./harness.js";

/** Alice makes two Clue tokens the plain way, her turn. */
const makeClues = (game: Parameters<typeof spawn>[0]): void => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 2 }, [], { source: spawn(game, "Forest", A) });
  settle(game);
};

describe("Esix, Fractal Bloom", () => {
  it("replaces the first token event with copies of a creature other than Esix", () => {
    const { game, a } = table();
    spawn(game, "Esix, Fractal Bloom", A);
    const bears = spawn(game, "Grizzly Bears", A);
    pickModes(a, 1);
    pickPermanents(a, bears);
    makeClues(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(3);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Clue Token")).toHaveLength(0);
  });

  it("offers only the plain tokens the second time this turn, and declining makes those", () => {
    const { game, a } = table();
    spawn(game, "Esix, Fractal Bloom", A);
    spawn(game, "Grizzly Bears", A);
    pickModes(a, 0); // decline: the tokens as the effect said
    makeClues(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    makeClues(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
    expect(asked).toBe(0);
  });

  it("no replacing on an opponent's turn", () => {
    const { game, a } = table();
    spawn(game, "Esix, Fractal Bloom", B);
    spawn(game, "Grizzly Bears", A);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    const source = spawn(game, "Forest", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Clue Token", count: 1 }, [], { source });
    expect(asked).toBe(false);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
  });

  it("with no other creature, nothing to choose: the tokens are made", () => {
    const { game } = table();
    spawn(game, "Esix, Fractal Bloom", A);
    makeClues(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });
});
