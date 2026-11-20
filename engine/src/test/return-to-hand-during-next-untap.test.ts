/**
 * `return-to-hand-during-next-untap`: Undiscovered Paradise's "During your
 * next untap step, as you untap your permanents, return this land to its
 * owner's hand" — part of the untap step (rule 502.3), not a trigger, the
 * controller's next one that isn't skipped (614.10a), and only the same
 * object (400.7).
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, hand, nextTurn, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Undiscovered Paradise", () => {
  it("tapped for mana, it stays through the opponent's turn and returns to hand in your next untap step", () => {
    const { game } = table();
    const paradise = spawn(game, "Undiscovered Paradise");
    cast(game, toHand(game, "Llanowar Elves"));
    expect(game.state.objects[paradise].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(zone(game, paradise)).toBe("battlefield");
    nextTurn(game, "upkeep");
    expect(zone(game, paradise)).toBe("hand");
    expect(hand(game, A)).toContain(paradise);
  });

  it("returns even when it wouldn't untap", () => {
    const { game } = table();
    const paradise = spawn(game, "Undiscovered Paradise");
    cast(game, toHand(game, "Llanowar Elves"));
    game.debugApplyEffect(B, { kind: "tap", target: 0, doesntUntapNext: true }, [ref(paradise)]);
    settle(game);
    nextTurn(game);
    nextTurn(game, "upkeep");
    expect(zone(game, paradise)).toBe("hand");
  });

  it("a skipped untap step leaves it waiting for the next one", () => {
    const { game } = table();
    const paradise = spawn(game, "Undiscovered Paradise");
    cast(game, toHand(game, "Llanowar Elves"));
    game.debugApplyEffect(B, { kind: "skip-untap-step", who: 0 }, [ref(A)]);
    settle(game);
    nextTurn(game);
    nextTurn(game, "upkeep");
    expect(game.state.turn.number).toBe(3);
    expect(zone(game, paradise)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game, "upkeep");
    expect(zone(game, paradise)).toBe("hand");
  });

  it("a land that left and came back since is a new object, and stays", () => {
    const { game } = table();
    const paradise = spawn(game, "Undiscovered Paradise");
    cast(game, toHand(game, "Llanowar Elves"));
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(paradise)]);
    settle(game);
    expect(zone(game, paradise)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game, "upkeep");
    expect(zone(game, paradise)).toBe("battlefield");
  });
});
