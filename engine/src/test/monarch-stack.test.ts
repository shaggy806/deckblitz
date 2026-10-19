/**
 * The monarch's two abilities are triggered abilities that use the stack (rule 725.2): "At the
 * beginning of the monarch's end step, that player draws a card" and "Whenever a creature deals
 * combat damage to the monarch, its controller becomes the monarch". Sourceless, controlled by
 * the monarch as they trigger — carried by the "The Monarch" object (`cards/monarch.ts`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import { A, B, hand, settle, spawn, table, toLibrary } from "./harness.js";

/** The names of the abilities on the stack, top last. */
const stackNames = (game: Game): string[] =>
  game.state.zones.shared.stack.map((id) => game.state.objects[id]?.cardName ?? "?");

describe("the monarch's abilities use the stack (rule 725.2)", () => {
  it("the end-step draw goes on the stack, controlled by the monarch, before anyone draws", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "become-monarch" });
    expect(game.state.monarch).toBe(A);
    toLibrary(game, "Island");
    const before = hand(game, A).length;
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    expect(stackNames(game)).toEqual(["The Monarch"]);
    const ability = game.state.objects[game.state.zones.shared.stack[0]!]!;
    expect(ability.controller).toBe(A);
    expect(hand(game, A).length).toBe(before);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("combat damage to the monarch triggers, and the attacker's controller becomes it as the ability resolves", () => {
    const { game, b } = table();
    game.debugApplyEffect(A, { kind: "become-monarch" });
    const raider = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: raider, defender: A }];
    game.advanceUntil(
      (s) => s.turn.number === 2 && s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0,
    );
    // Still Alice's until the ability resolves — it can be responded to.
    expect(stackNames(game)).toEqual(["The Monarch"]);
    expect(game.state.monarch).toBe(A);
    settle(game);
    expect(game.state.monarch).toBe(B);
  });

  it("a monarch set without the ability object (an older saved state) still gets its abilities", () => {
    const { game } = table();
    game.state.monarch = A;
    expect(game.state.monarchAbility).toBeUndefined();
    toLibrary(game, "Island");
    const before = hand(game, A).length;
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
