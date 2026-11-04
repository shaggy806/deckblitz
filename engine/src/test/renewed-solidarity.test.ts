/**
 * Renewed Solidarity — "for each token you control of the chosen type that
 * entered this turn, create a token that's a copy of it" at your end step:
 * `create-token-copy`'s `{ each }` over `token`, `enteredThisTurn` and
 * `ofChosenType` together, all three built already.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, enter, lands, nextTurn, pt, spawn, table, toHand, toStep, tokensNamed } from "./harness.js";

const withSolidarity = (type = "Goblin") => {
  const t = table();
  const solidarity = spawn(t.game, "Renewed Solidarity");
  t.game.state.objects[solidarity].chosenCreatureType = type;
  return { ...t, solidarity };
};

describe("Renewed Solidarity", () => {
  it("asks for a type as it enters", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Goblin";
    lands(game, "Plains", 3);
    const solidarity = toHand(game, "Renewed Solidarity");
    cast(game, solidarity);
    expect(game.state.objects[solidarity]).toMatchObject({ zone: "battlefield", chosenCreatureType: "Goblin" });
  });

  it("gives your creatures of the chosen type +1/+0, not another type's or an opponent's", () => {
    const { game } = withSolidarity("Bear");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const lion = spawn(game, "Savannah Lions");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, lion)).toEqual({ power: 2, toughness: 1 });
  });

  it("copies each token of the type that entered this turn, a stack once per token, and not the copies", () => {
    const { game } = withSolidarity();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 2 });
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.step !== "end");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(4);
  });

  it("leaves another type's tokens, an opponent's, and a token from an earlier turn", () => {
    const { game } = withSolidarity();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    const before = tokensNamed(game, "Goblin Token", A);
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 1 });
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.step !== "end");
    // Just this turn's: the older Goblin stays one, the new one becomes two.
    expect(tokensNamed(game, "Goblin Token", A)).toBe(before + 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Goblin Token", B)).toBe(1);
  });

  it("doesn't trigger at an opponent's end step", () => {
    const { game } = withSolidarity();
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    toStep(game, "end", B);
    game.advanceUntil((s) => s.turn.step !== "end");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
  });

  it("copies a token that's a copy of a nontoken creature as what it copied", () => {
    const { game } = withSolidarity("Bear");
    const bear = enter(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: { each: { name: "Grizzly Bears", token: false } }, count: 1 });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.step !== "end");
    // The card itself isn't a token: its copy is, and that copy is copied once.
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(2);
    expect(game.state.objects[bear].isToken).toBe(false);
  });

  it("still copies with the enchantment gone, by the type it last had chosen", () => {
    const { game, solidarity } = withSolidarity();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 });
    toStep(game, "end");
    expect(game.state.zones.shared.stack.length).toBe(1);
    destroy(game, solidarity);
    expect(game.state.objects[solidarity].zone).toBe("graveyard");
    game.advanceUntil((s) => s.turn.step !== "end");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
  });
});
