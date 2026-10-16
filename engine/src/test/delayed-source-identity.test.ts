/**
 * A delayed trigger's "it" — its source — is the object its creating ability
 * knew (rule 400.7). Blinked in response to that ability, the source comes
 * back as a new object, and "sacrifice it at the beginning of the next end
 * step" finds nothing (Attack-in-the-Box).
 */
import { describe, expect, it } from "vitest";

import { A, B, nextTurn, pickModes, ref, settle, spawn, table, zone } from "./harness.js";

describe("a delayed trigger's source", () => {
  it("Attack-in-the-Box unblinked: +4/+0 and sacrificed at the next end step", () => {
    const { game, a } = table();
    const box = spawn(game, "Attack-in-the-Box");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: box, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(zone(game, box)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, box)).toBe("graveyard");
  });

  it("blinked in response to its attack trigger, the new Attack-in-the-Box isn't sacrificed", () => {
    const { game, a } = table();
    const box = spawn(game, "Attack-in-the-Box");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: box, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(box)]);
    settle(game);
    expect(zone(game, box)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, box)).toBe("battlefield");
  });
});
