/**
 * The `repeat` effect — "repeat this process": a set number of passes ("proliferate X times",
 * "repeat the following process X times"), another pass while a condition on the pass just done
 * holds ("if an Insect card was milled this way, … repeat this process"), and "you may repeat
 * this process any number of times". Each pass is its own "this way"; what follows the process
 * reads every pass (Demonlord Belzenlok).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";

import { A, B, graveyard, hand, life, settle, table, toHand, toLibrary } from "./harness.js";

describe("repeat a set number of times", () => {
  it("draws once per pass", () => {
    const { game } = table();
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "repeat", times: 3, effect: { kind: "draw", amount: 1 } });
    settle(game);
    expect(hand(game)).toHaveLength(before + 3);
  });

  it("none at all for 0", () => {
    const { game } = table();
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "repeat", times: 0, effect: { kind: "draw", amount: 1 } });
    settle(game);
    expect(hand(game)).toHaveLength(before);
  });

  it("a pass that stops to ask is answered before the next begins", () => {
    const { game, b } = table();
    toHand(game, "Hill Giant", B);
    let discards = 0;
    b.chooseDiscardsFn = (cards) => {
      discards += 1;
      return [cards[0]!.id];
    };
    const before = hand(game, B).length;
    game.debugApplyEffect(A, {
      kind: "repeat",
      times: 2,
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
    });
    settle(game);
    expect(discards).toBe(2);
    expect(hand(game, B)).toHaveLength(before - 2);
  });
});

describe("repeat while the pass just done says so", () => {
  // Grist's shape: mill a card; if a Bear was milled this way, repeat.
  const MILL_WHILE_BEAR: EffectSpec = {
    kind: "repeat",
    effect: { kind: "mill", target: "you", amount: 1 },
    again: { kind: "this-way", what: "milled", filter: { subtype: "Bear" } },
  };

  it("stops at the first pass that milled no Bear — each pass reads only its own mill", () => {
    const { game } = table();
    // Library from the top: Bears, Bears, Giant, Bears.
    toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    const before = graveyard(game).length;
    game.debugApplyEffect(A, MILL_WHILE_BEAR);
    settle(game);
    expect(graveyard(game)).toHaveLength(before + 3);
    expect(graveyard(game)).toContain(giant);
  });

  it("two cards that share a color milled this way (Grindstone)", () => {
    const { game } = table();
    // Top two green (a pair sharing green), then a green and a red: the second
    // pass shares none, so it stops after two passes.
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    const before = graveyard(game).length;
    game.debugApplyEffect(A, {
      kind: "repeat",
      effect: { kind: "mill", target: "you", amount: 2 },
      again: { kind: "this-way", what: "milled", sharing: "color", atLeast: 2 },
    });
    settle(game);
    expect(graveyard(game)).toHaveLength(before + 4);
  });

  it("what follows reads every pass (Demonlord Belzenlok's 'for each card … this way')", () => {
    const { game } = table();
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [MILL_WHILE_BEAR, { kind: "lose-life", amount: { thisWay: "milled" }, who: "you" }],
    });
    settle(game);
    expect(life(game)).toBe(17);
  });
});

describe("you may repeat this process", () => {
  it("asks after each pass, and stops at the first no", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return asked < 3 ? [0] : [];
    };
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "repeat", mayAgain: true, effect: { kind: "draw", amount: 1 } });
    settle(game);
    expect(asked).toBe(3);
    expect(hand(game)).toHaveLength(before + 3);
  });
});
