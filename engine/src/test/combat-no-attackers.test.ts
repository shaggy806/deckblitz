import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, destroy, lands, ref, spawn, table, toHand, toStep } from "./harness.js";

/**
 * Rule 508.8: "If no creatures are declared as attackers or put onto the
 * battlefield attacking, skip the declare blockers and combat damage steps."
 * A rules audit (2026-11-17): a live four-player game's log showed both steps
 * played, a round of priority each, in a combat with no attackers.
 */
const stepsOfTurn = (game: Game, turn: number): string[] => {
  const steps: string[] = [];
  let at = 0;
  for (const event of game.state.eventLog) {
    if (event.type === "turn-began") at = event.turn;
    if (event.type === "step-began" && at === turn) steps.push(event.step);
  }
  return steps;
};
const COMBAT = ["begin-combat", "declare-attackers", "declare-blockers", "combat-damage", "end-combat"];
const combatSteps = (game: Game, turn: number): string[] => stepsOfTurn(game, turn).filter((s) => COMBAT.includes(s));

describe("a combat with no attackers (rule 508.8)", () => {
  it("skips the declare blockers and combat damage steps", () => {
    const { game } = table();
    const turn = game.state.turn.number;
    toStep(game, "postcombat-main");
    expect(combatSteps(game, turn)).toEqual(["begin-combat", "declare-attackers", "end-combat"]);
  });

  it("skips them with creatures that could have attacked and didn't", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [];
    const turn = game.state.turn.number;
    toStep(game, "postcombat-main");
    expect(combatSteps(game, turn)).toEqual(["begin-combat", "declare-attackers", "end-combat"]);
  });

  it("plays all five steps when a creature attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    const turn = game.state.turn.number;
    toStep(game, "postcombat-main");
    expect(combatSteps(game, turn)).toEqual(COMBAT);
  });

  it("leaves no time to cast a spell that is cast 'only during combat after blockers are declared' (rule 506.8f)", () => {
    // Chaotic Strike. The end of combat step is still there, but blockers
    // were never declared in this combat.
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const strike = toHand(game, "Chaotic Strike");
    game.advanceUntil((s) => s.turn.step === "end-combat" && s.awaiting === null && s.priority.holder === A);
    expect(game.state.turn.number).toBe(1);
    const cast = { type: "cast-spell", player: A, card: strike, targets: [ref(bears)] } as const;
    expect(game.canDispatch(cast)).not.toBe(null);
  });

  it("lets that spell be cast at the end of a combat that had blockers declared", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const strike = toHand(game, "Chaotic Strike");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "end-combat" && s.awaiting === null && s.priority.holder === A);
    expect(game.state.turn.number).toBe(1);
    const cast = { type: "cast-spell", player: A, card: strike, targets: [ref(bears)] } as const;
    expect(game.canDispatch(cast)).toBe(null);
  });

  it("plays all five when the one attacker declared has left combat since", () => {
    // The rule is about what was declared, not what is still attacking.
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(combatSteps(game, turn)).toEqual(COMBAT);
  });
});
