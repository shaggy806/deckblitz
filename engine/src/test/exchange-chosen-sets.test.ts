import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, controller, grant, lands, ref, spawn, table, toHand } from "./harness.js";

/**
 * `exchange-control-all`'s `between`: two players other than the effect's
 * controller exchange control of a set — Cultural Exchange's "Choose any
 * number of creatures target player controls. Choose the same number of
 * creatures another target player controls. Those players exchange control
 * of those creatures."
 */

/** The seat answers its choose-permanents decisions in turn, recording each
 * one's eligible permanents and bounds. */
function chooseInTurn(
  seat: ScriptedController,
  ...answers: readonly (readonly ObjectId[])[]
): { eligible: readonly ObjectId[]; min: number; max: number }[] {
  const offered: { eligible: readonly ObjectId[]; min: number; max: number }[] = [];
  let next = 0;
  seat.choosePermanentsFn = (_view, eligible, min, max) => {
    offered.push({ eligible, min, max });
    const answer = answers[next] ?? [];
    next += 1;
    return answer;
  };
  return offered;
}

describe("Cultural Exchange", () => {
  it("two other players exchange control of the creatures chosen, the same number from each", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", C);
    const dragon = spawn(game, "Shivan Dragon", C);
    // Chosen, not targeted: hexproof doesn't stop it.
    grant(game, giant, "hexproof");
    const offered = chooseInTurn(a, [bears, giant], [dragon, angel]);
    cast(game, toHand(game, "Cultural Exchange"), { targets: [ref(B), ref(C)] });
    expect(offered).toHaveLength(2);
    // Up to as many as the second player controls.
    expect(offered[0].max).toBe(2);
    expect([...offered[0].eligible].sort()).toEqual([bears, elves, giant].sort());
    // Exactly as many as the first choice took, from the second player's.
    expect(offered[1].min).toBe(2);
    expect(offered[1].max).toBe(2);
    expect([...offered[1].eligible].sort()).toEqual([angel, dragon].sort());
    expect(controller(game, bears)).toBe(C);
    expect(controller(game, giant)).toBe(C);
    expect(controller(game, elves)).toBe(B);
    expect(controller(game, angel)).toBe(B);
    expect(controller(game, dragon)).toBe(B);
    // One lasting effect, with one timestamp.
    const stamps = new Set([bears, giant, angel, dragon].map((id) => game.state.objects[id].controlEffects?.at(-1)?.timestamp));
    expect(stamps.size).toBe(1);
  });

  it("the caster may be the first player, and one creature each is a swap", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const elves = spawn(game, "Llanowar Elves");
    const dragon = spawn(game, "Shivan Dragon", B);
    chooseInTurn(a, [elves], [dragon]);
    cast(game, toHand(game, "Cultural Exchange"), { targets: [ref(A), ref(B)] });
    expect(controller(game, elves)).toBe(B);
    expect(controller(game, dragon)).toBe(A);
  });

  it("choosing none exchanges nothing, and nothing more is asked", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const elves = spawn(game, "Llanowar Elves");
    const dragon = spawn(game, "Shivan Dragon", B);
    const offered = chooseInTurn(a, []);
    cast(game, toHand(game, "Cultural Exchange"), { targets: [ref(A), ref(B)] });
    expect(offered).toHaveLength(1);
    expect(controller(game, elves)).toBe(A);
    expect(controller(game, dragon)).toBe(B);
  });

  it("with no creatures on the second player's side, nothing is asked", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const elves = spawn(game, "Llanowar Elves");
    const offered = chooseInTurn(a, [elves]);
    cast(game, toHand(game, "Cultural Exchange"), { targets: [ref(A), ref(B)] });
    expect(offered).toHaveLength(0);
    expect(controller(game, elves)).toBe(A);
  });
});
