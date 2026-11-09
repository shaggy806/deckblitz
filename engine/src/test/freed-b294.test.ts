import { describe, expect, it } from "vitest";
import { activePlayerOf } from "../state.js";
import { A, B, activate, cast, enter, hand, lands, ref, spawn, table, toHand } from "./harness.js";

describe("Desert: still attacking during the end of combat step (rule 511.3)", () => {
  it("hits an attacker at end of combat, and can't be activated earlier", () => {
    const { game, b } = table();
    const desert = enter(game, "Desert");
    const bear = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bear, defender: A }];

    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(() => activate(game, desert, 1, { targets: [ref(bear)] })).toThrow();

    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "end-combat" && s.priority.holder === A);
    expect(game.state.objects[bear].attacking).toBe(A);
    activate(game, desert, 1, { targets: [ref(bear)] });
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });
});

describe("Satoru, the Infiltrator: nontoken limits only the others", () => {
  it("a token copy of Satoru draws on its own entry; another token doesn't", () => {
    const { game } = table();
    const satoru = spawn(game, "Satoru, the Infiltrator");
    lands(game, "Mountain", 3);
    const before = hand(game).length;
    const spell = toHand(game, "Heat Shimmer");
    cast(game, spell, { targets: [ref(satoru)] });
    expect(hand(game).length).toBe(before + 1);
  });
});
