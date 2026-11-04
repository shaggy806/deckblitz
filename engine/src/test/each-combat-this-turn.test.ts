/**
 * "After this main phase, there are two additional combat phases. At the
 * beginning of each combat this turn, untap all creatures that attacked this
 * turn": phases with no main phase between them, and a delayed ability with a
 * duration that triggers in every combat left in the turn (rule 603.7b).
 *
 * Proving card: Full Throttle.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameEvent } from "../events.js";
import { A, B, cast, life, nextTurn, settle, spawn, table, toHand, toStep, lands, type Table } from "./harness.js";

const countOf = (game: Game, type: GameEvent["type"]): number =>
  game.state.eventLog.filter((e) => e.type === type).length;

/** The steps entered from now on, in order, recorded as `advance` goes. */
function stepsWhile(game: Game, until: (game: Game) => boolean): string[] {
  const seen: string[] = [game.state.turn.step];
  const turn = game.state.turn.number;
  game.advanceUntil((s) => {
    const last = seen[seen.length - 1];
    if (s.turn.step !== last && s.turn.number === turn) seen.push(s.turn.step);
    return s.turn.number !== turn || until(game);
  });
  return seen;
}

/** Everything given attacks whenever it can, the seat's own or another's. */
function alwaysAttack(t: Table, seat: "a" | "b", attackers: readonly ObjectId[], defender = B): void {
  t[seat].declareAttackersFn = () =>
    attackers
      .filter((id) => t.game.state.objects[id].tapped !== true)
      .map((attacker) => ({ attacker, defender }));
}

const FULL_THROTTLE_MANA = 6;

function full(t: Table, player = A): ObjectId {
  lands(t.game, "Mountain", FULL_THROTTLE_MANA, player);
  return toHand(t.game, "Full Throttle", player);
}

describe("Full Throttle", () => {
  it("from the postcombat main: two combat phases with no main phase between, then the end step", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, "a", [bear]);
    const card = full(t);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bear].tapped).toBe(true);

    cast(game, card);
    settle(game);
    expect(game.state.turn.step).toBe("postcombat-main");

    const mains = game.state.turn.mainPhases;
    const steps = stepsWhile(game, (g) => g.state.turn.step === "end");
    // No third combat, and no main phase after either.
    expect(steps.filter((s) => s === "begin-combat")).toHaveLength(2);
    expect(steps.filter((s) => s.endsWith("-main")).length).toBe(1);
    expect(game.state.turn.step).toBe("end");
    expect(game.state.turn.mainPhases).toBe(mains);
    expect(game.state.turn.combatPhases).toBe(3);
    // It untapped as each began, so it attacked in both.
    expect(life(game, B)).toBe(14);
    expect(countOf(game, "additional-combat-phase")).toBe(2);
  });

  it("from the precombat main: both come first, then the turn's own, which untaps too, then the second main", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, "a", [bear]);
    const card = full(t);
    toStep(game, "precombat-main");
    const before = life(game, B);
    cast(game, card);
    settle(game);

    const steps = stepsWhile(game, (g) => g.state.turn.step === "end");
    expect(steps.filter((s) => s === "begin-combat")).toHaveLength(3);
    expect(steps.filter((s) => s === "postcombat-main")).toHaveLength(1);
    expect(steps.indexOf("postcombat-main")).toBeGreaterThan(steps.lastIndexOf("end-combat"));
    expect(game.state.turn.combatPhases).toBe(3);
    expect(game.state.turn.mainPhases).toBe(2);
    // Two additional combats and the turn's own, one attack each.
    expect(game.state.eventLog.filter((e) => e.type === "additional-combat-phase")).toHaveLength(2);
    expect(life(game, B)).toBe(before - 6);
  });

  it("untaps what attacked, on both sides, and nothing else", () => {
    const t = table();
    const { game } = t;
    const attacker = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    t.a.declareAttackersFn = () =>
      game.state.turn.combatPhases === 1 ? [{ attacker, defender: B }] : [];
    const card = full(t);
    toStep(game, "postcombat-main");
    expect(game.state.objects[attacker].tapped).toBe(true);
    cast(game, card);
    settle(game);
    game.advanceUntil((s) => s.turn.step === "declare-attackers" || s.turn.step === "end");
    expect(game.state.objects[attacker].tapped).toBe(false);
    expect(game.state.objects[idle].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("each trigger is its own ability on the stack, in each combat, and none outlasts the turn", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, "a", [bear]);
    const card = full(t);
    toStep(game, "postcombat-main");
    cast(game, card);
    settle(game);
    const stacked: string[] = [];
    game.advanceUntil((s) => {
      const top = s.zones.shared.stack[s.zones.shared.stack.length - 1];
      if (top !== undefined && s.turn.step === "begin-combat" && !stacked.includes(`${s.turn.combatPhases}`)) {
        stacked.push(`${s.turn.combatPhases}`);
      }
      return s.turn.step === "end";
    });
    expect(stacked).toEqual(["2", "3"]);

    // The next turn is a new one: an attacker there stays tapped.
    const hers = spawn(game, "Grizzly Bears", B);
    alwaysAttack(t, "b", [hers], A);
    nextTurn(game, "postcombat-main");
    expect(game.state.objects[hers].tapped).toBe(true);
    expect(game.state.delayedTriggers.filter((d) => d.text?.includes("each combat this turn"))).toEqual([]);
  });

  it("cast in an opponent's main phase, that opponent attacks in them, and its creatures untap (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vedalken Orrery");
    const hers = spawn(game, "Grizzly Bears", B);
    alwaysAttack(t, "b", [hers], A);
    t.a.declareBlockersFn = () => [];
    const card = full(t);
    // Bob's turn, with Alice holding priority once he's passed.
    game.advanceUntil(
      (s) => s.turn.step === "postcombat-main" && s.turn.activePlayerIndex === s.turnOrder.indexOf(B) && s.priority.holder === A,
    );
    expect(life(game, A)).toBe(18);

    cast(game, card);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(3);
    expect(life(game, A)).toBe(14);
  });

  it("cast when it's no main phase, no phases are added, but the second ability still works (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vedalken Orrery");
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, "a", [bear]);
    const card = full(t);
    toStep(game, "end-combat");
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bear].tapped).toBe(true);

    cast(game, card);
    settle(game);
    expect(countOf(game, "additional-combat-queued")).toBe(0);
    expect(game.state.turn.step).toBe("end-combat");

    // A combat from somewhere else: the delayed ability untaps it there.
    toStep(game, "postcombat-main");
    game.debugApplyEffect(A, { kind: "additional-combat", afterThisPhase: true }, []);
    settle(game);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(life(game, B)).toBe(16);
  });

  it("two of them in one main phase add four phases, and two untaps each combat do no more than one", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, "a", [bear]);
    const first = full(t);
    const second = full(t);
    toStep(game, "postcombat-main");
    cast(game, first);
    settle(game);
    cast(game, second);
    settle(game);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(5);
    expect(life(game, B)).toBe(10);
  });
});
