/**
 * A `turn-history` condition's `excludeSelf` ("if **another** Human died under your control this
 * turn") leaves out the source as it is now, not the same card in an earlier stint: one that died
 * and came back is a new object (rule 400.7), so its own earlier death is "another Human's".
 */
import { describe, expect, it } from "vitest";

import { A, destroy, ref, settle, spawn, table, toStep } from "./harness.js";

const foods = (game: ReturnType<typeof table>["game"]): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Food Token").length;

describe("turn-history excludeSelf compares stints (400.7)", () => {
  it("White Glove Gourmand counts its own death from an earlier stint", () => {
    const { game } = table();
    const gourmand = spawn(game, "White Glove Gourmand");
    destroy(game, gourmand);
    // Back the same turn: a new object.
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(gourmand)]);
    settle(game);
    expect(game.state.objects[gourmand].zone).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(foods(game)).toBe(1);
  });

  it("but not its current stint: no other Human died, no Food", () => {
    const { game } = table();
    spawn(game, "White Glove Gourmand");
    toStep(game, "end");
    settle(game);
    expect(foods(game)).toBe(0);
  });
});
