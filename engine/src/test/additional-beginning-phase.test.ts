/**
 * `additional-beginning-phase` — "there is an additional beginning phase
 * after this phase" (rule 500.8). Sphinx of the Second Sun: from the
 * postcombat main phase, an untap, upkeep and draw step, then the ending
 * phase, all in the same turn (its rulings): permanents untap and a card is
 * drawn, but summoning sickness doesn't wear off (302.6).
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, hand, quiet, ref, settle, spawn, table } from "./harness.js";
import type { Game } from "../game.js";
import type { Step } from "../turn.js";

const stepsOf = (game: Game, run: () => void): Step[] => {
  const from = game.state.eventLog.length;
  run();
  return game.state.eventLog.slice(from).flatMap((e) => (e.type === "step-began" ? [e.step] : []));
};

describe("additional beginning phase — Sphinx of the Second Sun", () => {
  it("adds untap, upkeep and draw after your postcombat main phase, then the end step", () => {
    const { game } = table();
    spawn(game, "Sphinx of the Second Sun");
    const swamp = spawn(game, "Swamp", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const before = hand(game).length;
    const steps = stepsOf(game, () =>
      game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A),
    );
    expect(game.state.turn.number).toBe(1);
    expect(steps.slice(steps.indexOf("postcombat-main"))).toEqual(["postcombat-main", "untap", "upkeep", "draw", "end"]);
    expect(game.state.objects[swamp].tapped).toBe(false);
    expect(game.state.objects[bears].summoningSick).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });

  it("comes after a combat phase added later in the same main phase (rule 500.8)", () => {
    const { game } = table();
    spawn(game, "Sphinx of the Second Sun");
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s) && s.priority.holder === A);
    const steps = stepsOf(game, () => {
      game.debugApplyEffect(A, { kind: "additional-combat", afterThisPhase: true }, []);
      game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A);
    });
    expect(game.state.turn.number).toBe(1);
    expect(steps[0]).toBe("begin-combat");
    expect(steps.slice(steps.indexOf("end-combat"))).toEqual(["end-combat", "untap", "upkeep", "draw", "end"]);
  });

  it("does nothing on an opponent's turn", () => {
    const { game } = table();
    spawn(game, "Sphinx of the Second Sun", B);
    const steps = stepsOf(game, () => game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A));
    expect(steps.slice(steps.indexOf("postcombat-main"))).toEqual(["postcombat-main", "end"]);
  });
});

describe("additional beginning phase — Shadow of the Second Sun", () => {
  it("gives the enchanted player's turn the extra phase", () => {
    const { game } = table();
    const shadow = spawn(game, "Shadow of the Second Sun", B);
    game.state.objects[shadow].attachedToPlayer = A;
    const steps = stepsOf(game, () => game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A));
    expect(steps.slice(steps.indexOf("postcombat-main"))).toEqual(["postcombat-main", "untap", "upkeep", "draw", "end"]);
  });
});

describe("additional beginning phase — Cyclonus, Cybertronian Fighter", () => {
  it("converts on combat damage and adds a beginning phase before the postcombat main phase", () => {
    const { game, a } = table();
    const cyclonus = spawn(game, "Cyclonus, the Saboteur");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(cyclonus)]);
    settle(game);
    expect(game.state.objects[cyclonus].face).toBe(1);
    const steps = stepsOf(game, () => attack(game, a, [cyclonus]));
    expect(game.state.players[B].life).toBe(15);
    expect(game.state.objects[cyclonus].face ?? 0).toBe(0);
    expect(steps.slice(steps.indexOf("end-combat"))).toEqual(["end-combat", "untap", "upkeep", "draw", "postcombat-main"]);
  });
});
