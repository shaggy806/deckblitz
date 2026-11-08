/**
 * Skipping a combat phase (rules 500.11, 614.10): `skip-step`'s `"combat"`. The
 * turn proceeds past the whole phase as though it didn't exist, nothing "at the
 * beginning of combat" or "at end of combat" happens, and "next" waits for that
 * player's own turn (614.10a).
 */
import { aimedAt } from "./combat-probe.js";
import { describe, expect, it } from "vitest";

import { A, B, C, attack, cast, enter, lands, nextTurn, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

type Game = ReturnType<typeof table>["game"];

/** Every step this game goes through from now until `done`. */
function stepsUntil(game: Game, done: (s: Game["state"]) => boolean): string[] {
  const seen: string[] = [];
  game.advanceUntil((s) => {
    const label = `${s.turn.number}:${s.turn.step}`;
    if (seen[seen.length - 1] !== label) seen.push(label);
    return done(s);
  });
  return seen;
}

const combatSteps = (steps: readonly string[], turn: number): string[] =>
  steps.filter((s) => s.startsWith(`${turn}:`) && /:(begin-combat|declare-attackers|declare-blockers|combat-damage|end-combat)$/.test(s));

describe("Stonehorn Dignitary", () => {
  it("skips the target opponent's next combat phase, and only that one", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Stonehorn Dignitary");
    expect(game.state.players[B].stepsToSkip?.combat).toBe(1);

    const steps = stepsUntil(game, (s) => s.turn.number === 4 && s.turn.step === "postcombat-main");
    // Bob's turn: main phase to main phase, and the log says so.
    expect(combatSteps(steps, 2)).toEqual([]);
    expect(steps).toContain("2:precombat-main");
    expect(steps).toContain("2:postcombat-main");
    expect(game.eventsOfType("step-skipped").filter((e) => e.step === "combat").map((e) => e.player)).toEqual([B]);
    // Alice's own combat wasn't touched.
    expect(combatSteps(steps, 3)).toContain("3:begin-combat");
    // Used up: Bob's next one happens.
    expect(combatSteps(steps, 4)).toContain("4:begin-combat");
    expect(game.state.players[B].stepsToSkip).toBeUndefined();
  });

  it("stops the skipped player's creatures attacking", () => {
    const { game, a, b } = table();
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Stonehorn Dignitary");
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    let asked = 0;
    b.declareAttackersFn = () => {
      asked += 1;
      return [{ attacker: bear, defender: A }];
    };
    nextTurn(game);
    toStep(game, "end", B);
    expect(asked).toBe(0);
    expect(game.state.players[A].life).toBe(20);
  });

  it("counts two as the next two (rule 614.10a)", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Stonehorn Dignitary");
    enter(game, "Stonehorn Dignitary");
    expect(game.state.players[B].stepsToSkip?.combat).toBe(2);
    const steps = stepsUntil(game, (s) => s.turn.number === 6 && s.turn.step === "postcombat-main");
    expect(combatSteps(steps, 2)).toEqual([]);
    expect(combatSteps(steps, 4)).toEqual([]);
    expect(combatSteps(steps, 6)).toContain("6:begin-combat");
  });

  it("has nothing \"at the beginning of combat\" happen on it", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Stonehorn Dignitary");
    // Raving Dead picks at the beginning of its controller's combat.
    const raving = spawn(game, "Raving Dead", B);
    stepsUntil(game, (s) => s.turn.number === 2 && s.turn.step === "postcombat-main");
    expect(aimedAt(game, raving)).toBeUndefined();
  });

  it("doesn't count a skipped combat as the turn's, and the additional one owed still comes", () => {
    const { game, a } = table();
    // Skipping your own next one, then a combat added in the main phase.
    a.chooseTargetsFn = () => [ref(A)];
    enter(game, "Revenant Patriarch"); // no {W} spent: no skip from it
    expect(game.state.players[A].stepsToSkip).toBeUndefined();
    game.state.players[A].stepsToSkip = { combat: 1 };
    game.state.extraCombats = 1;
    const steps = stepsUntil(game, (s) => s.turn.number === 1 && s.turn.step === "end");
    // The first skipped, the postcombat main, then the additional combat.
    expect(steps.indexOf("1:postcombat-main")).toBeLessThan(steps.indexOf("1:begin-combat"));
    expect(steps).toContain("1:begin-combat");
    expect(game.state.turn.combatPhases).toBe(1);
  });
});

describe("Blinding Angel", () => {
  it("skips the next combat phase of the player it hits", () => {
    const { game, a } = table({ players: 3 });
    const angel = spawn(game, "Blinding Angel", A, { sick: false });
    attack(game, a, [angel], C);
    expect(game.state.players[C].stepsToSkip?.combat).toBe(1);
    expect(game.state.players[B].stepsToSkip).toBeUndefined();
    const steps = stepsUntil(game, (s) => s.turn.number === 3 && s.turn.step === "postcombat-main");
    expect(combatSteps(steps, 2)).toContain("2:begin-combat");
    expect(combatSteps(steps, 3)).toEqual([]);
  });
});

describe("Revenant Patriarch", () => {
  it("skips a combat with {W} spent to cast it", () => {
    const { game, a } = table();
    const card = toHand(game, "Revenant Patriarch");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 4);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, card);
    settle(game);
    expect(game.state.players[B].stepsToSkip?.combat).toBe(1);
  });

  it("can't block", () => {
    const { game, a, b } = table();
    spawn(game, "Revenant Patriarch");
    const bear = spawn(game, "Grizzly Bears", B, { sick: false });
    a.declareBlockersFn = () => {
      throw new Error("nothing can block");
    };
    nextTurn(game);
    attack(game, b, [bear], A);
    expect(game.state.players[A].life).toBe(18);
  });

  it("does nothing without {W}", () => {
    const { game, a } = table();
    const card = toHand(game, "Revenant Patriarch");
    lands(game, "Swamp", 5);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(B)];
    };
    cast(game, card);
    settle(game);
    expect(asked).toBe(0);
    expect(game.state.players[B].stepsToSkip).toBeUndefined();
  });
});

describe("Moment of Silence", () => {
  it("skips the target's combat phase this turn", () => {
    const { game } = table();
    const card = toHand(game, "Moment of Silence");
    lands(game, "Plains", 1);
    cast(game, card, { targets: [ref(A)] });
    settle(game);
    const steps = stepsUntil(game, (s) => s.turn.number === 1 && s.turn.step === "end");
    expect(combatSteps(steps, 1)).toEqual([]);
    expect(game.state.turn.skipsThisTurn).toBeUndefined();
  });

  it("does nothing to a player whose turn it isn't, then or later", () => {
    const { game } = table();
    const card = toHand(game, "Moment of Silence");
    lands(game, "Plains", 1);
    cast(game, card, { targets: [ref(B)] });
    settle(game);
    const steps = stepsUntil(game, (s) => s.turn.number === 2 && s.turn.step === "end");
    expect(combatSteps(steps, 1)).toContain("1:begin-combat");
    expect(combatSteps(steps, 2)).toContain("2:begin-combat");
  });

  it("lapses unused with the turn: a combat already under way can't be skipped", () => {
    const { game } = table();
    const card = toHand(game, "Moment of Silence");
    lands(game, "Plains", 1);
    toStep(game, "declare-attackers", A);
    cast(game, card, { targets: [ref(A)] });
    settle(game);
    expect(game.state.turn.step).toBe("declare-attackers");
    const steps = stepsUntil(game, (s) => s.turn.number === 3 && s.turn.step === "end");
    // This combat went on, and Alice's next turn has its combat.
    expect(steps).toContain("1:end-combat");
    expect(combatSteps(steps, 3)).toContain("3:begin-combat");
  });
});

describe("False Peace", () => {
  it("skips every combat phase of their next turn, an additional one too", () => {
    const { game, a } = table();
    const card = toHand(game, "False Peace");
    lands(game, "Plains", 1);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, card, { targets: [ref(B)] });
    settle(game);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    game.state.extraCombats = 1;
    const steps = stepsUntil(game, (s) => s.turn.number === 4 && s.turn.step === "postcombat-main");
    expect(game.state.players[B].noCombatNextTurn).toBeUndefined();
    expect(combatSteps(steps, 2)).toEqual([]);
    expect(steps.filter((s) => s === "2:postcombat-main")).toHaveLength(1);
    expect(combatSteps(steps, 3)).toContain("3:begin-combat");
    expect(combatSteps(steps, 4)).toContain("4:begin-combat");
  });

  it("means your next turn when you cast it on yourself, not this one", () => {
    const { game } = table();
    const card = toHand(game, "False Peace");
    lands(game, "Plains", 1);
    cast(game, card, { targets: [ref(A)] });
    settle(game);
    const steps = stepsUntil(game, (s) => s.turn.number === 3 && s.turn.step === "end");
    expect(combatSteps(steps, 1)).toContain("1:begin-combat");
    expect(combatSteps(steps, 2)).toContain("2:begin-combat");
    expect(combatSteps(steps, 3)).toEqual([]);
  });

  it("waits past a skipped turn for the first one that isn't", () => {
    const { game } = table();
    const card = toHand(game, "False Peace");
    lands(game, "Plains", 1);
    cast(game, card, { targets: [ref(B)] });
    settle(game);
    game.state.players[B].turnsToSkip = 1;
    // Turn numbers count turns taken: Alice's 2, Bob's 3.
    const steps = stepsUntil(game, (s) => s.turn.number === 3 && s.turn.step === "postcombat-main");
    expect(game.state.turn.noCombat).toBe(true);
    expect(game.activePlayer).toBe(B);
    expect(combatSteps(steps, 2)).toContain("2:begin-combat");
    expect(combatSteps(steps, 3)).toEqual([]);
  });

  it("two of them are still only the next turn", () => {
    const { game } = table();
    for (let i = 0; i < 2; i += 1) {
      const card = toHand(game, "False Peace");
      lands(game, "Plains", 1);
      cast(game, card, { targets: [ref(B)] });
      settle(game);
    }
    const steps = stepsUntil(game, (s) => s.turn.number === 4 && s.turn.step === "postcombat-main");
    expect(combatSteps(steps, 2)).toEqual([]);
    expect(combatSteps(steps, 4)).toContain("4:begin-combat");
  });

  it("uses up no \"next combat\" skip on a turn that's already combatless (rule 614.10a)", () => {
    const { game } = table();
    const card = toHand(game, "False Peace");
    lands(game, "Plains", 1);
    cast(game, card, { targets: [ref(B)] });
    settle(game);
    game.state.players[B].stepsToSkip = { combat: 1 };
    const steps = stepsUntil(game, (s) => s.turn.number === 4 && s.turn.step === "postcombat-main");
    expect(combatSteps(steps, 2)).toEqual([]);
    expect(combatSteps(steps, 4)).toEqual([]);
  });
});

describe("Empty City Ruse", () => {
  it("can only target an opponent", () => {
    const { game } = table();
    const card = toHand(game, "Empty City Ruse");
    lands(game, "Plains", 1);
    expect(() => cast(game, card, { targets: [ref(A)] })).toThrow();
    cast(game, card, { targets: [ref(B)] });
    settle(game);
    expect(game.state.players[B].noCombatNextTurn).toBe(true);
  });
});
