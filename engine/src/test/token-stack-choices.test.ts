/**
 * The last two places a compacted token stack was one thing when the rules
 * say it is many: choosing which of it proliferate reaches (701.34a), and
 * naming two of it for one "target" (601.2c).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { otherSlotConflict, slotOptions, targetsFillable, type TargetSpec } from "../target.js";
import { A, B, cast, lands, ref, settle, spawn, table, toHand, tokensNamed } from "./harness.js";

const GOBLIN = "Goblin Token";

/** "N target creatures", the way `distinctTargets` writes it. */
const distinctSpecs = (n: number): readonly TargetSpec[] =>
  Array.from({ length: n }, (_v, i) =>
    i === 0
      ? ("creature" as const)
      : ({ kind: "other", of: "creature", than: { slots: Array.from({ length: i }, (_u, j) => j) } } as const),
  );

function stackOf(game: Game, player: PlayerId, count: number, plusOnes = 0): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: GOBLIN, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === GOBLIN && (game.state.objects[id].stackCount ?? 1) === count,
  );
  if (stack === undefined) throw new Error(`expected one stack of ${count}`);
  if (plusOnes > 0) game.state.objects[stack].counters = { "+1/+1": plusOnes };
  return stack;
}

/** Each pile of Goblins on the battlefield, as "tokens x counters". */
const piles = (game: Game): readonly string[] =>
  game.state.zones.shared.battlefield
    .map((id) => game.state.objects[id])
    .filter((o) => o.cardName === GOBLIN)
    .map((o) => `${o.stackCount ?? 1}x${o.counters["+1/+1"] ?? 0}`)
    .sort();

describe("distinct targets in one token stack (601.2c)", () => {
  it("destroys two Goblins of one stack with \"two target creatures\"", () => {
    const { game } = table();
    const stack = stackOf(game, B, 8);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Reckless Spite"), { targets: [ref(stack), ref(stack)] });
    expect(tokensNamed(game, GOBLIN)).toBe(6);
  });

  it("casts it with one stack of two on the battlefield and nothing else", () => {
    const { game } = table();
    const stack = stackOf(game, B, 8);
    game.state.objects[stack].stackCount = 2;
    lands(game, "Swamp", 3);
    const spite = toHand(game, "Reckless Spite");
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === spite)).toBe(true);
    cast(game, spite, { targets: [ref(stack), ref(stack)] });
    expect(tokensNamed(game, GOBLIN)).toBe(0);
  });

  it("refuses three of a stack of two for a group of up to three", () => {
    const { game } = table();
    const stack = stackOf(game, B, 8);
    game.state.objects[stack].stackCount = 2;
    lands(game, "Swamp", 3);
    const spite = toHand(game, "Reckless Spite");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spite, targets: [ref(stack), ref(stack), ref(stack)] }),
    ).not.toBeNull();
  });

  it("isn't castable at one token and nothing else", () => {
    const { game } = table();
    spawn(game, GOBLIN, B);
    lands(game, "Swamp", 3);
    const spite = toHand(game, "Reckless Spite");
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === spite)).toBe(false);
  });

  it("refuses more targets on a stack than it has tokens", () => {
    const facts = { controllerOf: () => undefined, powerOf: () => 0, stackSize: () => 2 };
    const stack = { kind: "object", object: "stack" as ObjectId } as const;
    const group = [{ kind: "any-number", of: "creature", min: 0, max: 3 } as const];
    const slot2 = slotOptions(group, [[stack]], 1, [stack], facts);
    expect(slot2).toEqual([stack]);
    expect(slotOptions(group, [[stack]], 2, [stack, stack], facts)).toEqual([]);
    const specs = distinctSpecs(3);
    expect(otherSlotConflict(specs, [stack, stack], facts)).toBeNull();
    expect(otherSlotConflict(specs, [stack, stack, stack], facts)).toEqual({ slot: 2, than: 0 });
  });

  it("without the facts a stack is still one object", () => {
    const stack = { kind: "object", object: "stack" as ObjectId } as const;
    expect(otherSlotConflict(distinctSpecs(2), [stack, stack])).toEqual({ slot: 1, than: 0 });
  });

  it("removes a trigger that wants more than the stack has, and keeps one it can fill", () => {
    const facts = { controllerOf: () => undefined, powerOf: () => 0, stackSize: () => 3 };
    const stack = { kind: "object", object: "stack" as ObjectId } as const;
    const twoOf = [{ kind: "any-number", of: "creature", min: 2, max: 2 } as const];
    expect(targetsFillable(twoOf, [[stack]], [], 0, facts)).toBe(true);
    expect(targetsFillable(twoOf, [[stack]], [], 0, { ...facts, stackSize: () => 1 })).toBe(false);
  });

  it("divides Inferno Titan's damage over three Goblins of one stack", () => {
    const { game } = table();
    const stack = stackOf(game, B, 8);
    const titan = spawn(game, "Inferno Titan", A);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: titan, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets");
    game.dispatch({
      type: "choose-targets",
      player: A,
      targets: [ref(stack), ref(stack), ref(stack)],
      division: [1, 1, 1],
    });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(tokensNamed(game, GOBLIN, B)).toBe(5);
  });
});

describe("proliferate over a token stack (701.34a)", () => {
  it("offers a stack with its size", () => {
    const { game } = table();
    const stack = stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    const offer = game.legalActions(A).find((l) => l.kind === "proliferate");
    expect(offer).toMatchObject({ copies: { [stack]: 8 } });
  });

  it("reaches only as many tokens of a stack as it is named", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 8, 1);
    a.chooseProliferateFn = () => [ref(stack), ref(stack), ref(stack)];
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["3x2", "5x1"]);
  });

  it("reaches every token when each is named, and stays one stack", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 8, 1);
    a.chooseProliferateFn = (_v, eligible) => eligible;
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["8x2"]);
    expect(game.state.objects[stack].counters["+1/+1"]).toBe(2);
  });

  it("refuses more of a stack than it holds", () => {
    const { game } = table();
    const stack = stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    const chosen = Array.from({ length: 9 }, () => ref(stack));
    expect(game.canDispatch({ type: "proliferate", player: A, chosen })).toMatch(/only 8/);
  });

  it("gives the default answer every token of your own stack", () => {
    const { game } = table();
    stackOf(game, A, 8, 1);
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(piles(game)).toEqual(["8x2"]);
  });
});
