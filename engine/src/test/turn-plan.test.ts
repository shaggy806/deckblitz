import { describe, expect, it } from "vitest";

import { BOT_BENCHMARKS, runBenchmark } from "../bot/benchmarks.js";
import { candidateActions } from "../bot/candidates.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { boardKey, planTurn, type PlanClock, type ScoredFirst, type TurnPlanHooks } from "../bot/turn-plan.js";
import { createDefaultRegistry } from "../cards.js";
import type { Action } from "../actions.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

const benchmark = (name: string) => {
  const found = BOT_BENCHMARKS.find((b) => b.name === name);
  if (found === undefined) throw new Error(`no benchmark "${name}"`);
  return found;
};

const planning = (player: PlayerId) => new EvalBotController(player, registry, { plan: "turn" });

// Planning our own turn (`bot/turn-plan.ts`) is off by default; these pin
// what it's for, on the benchmarks it was built against, and the replay that
// keeps it from searching every window again.
describe("planning our own turn", () => {
  it("casts Dark Ritual, Dark Ritual, Grave Titan", () => {
    const report = runBenchmark(benchmark("two Rituals into Grave Titan"), registry, planning);
    expect(report.passed, report.detail).toBe(true);
  });

  it("steals the Wurm, attacks with it, then sacrifices it after combat", () => {
    const report = runBenchmark(benchmark("steals the Wurm, swings with it, and sacrifices it"), registry, planning);
    expect(report.passed, report.detail).toBe(true);
  });

  it("replays the rest of its line rather than searching again", () => {
    const game = benchmark("two Rituals into Grave Titan").setup(registry);
    const alice = game.state.turnOrder[0];
    const bot = new EvalBotController(alice, registry, { plan: "turn" });
    const turn = game.state.turn.number;
    const casts: string[] = [];
    for (let i = 0; i < 60 && game.state.turn.number === turn; i += 1) {
      game.advanceUntil(
        (s) => s.priority.holder === alice || s.awaiting?.player === alice || s.turn.number !== turn,
      );
      if (game.state.turn.number !== turn) break;
      const action = bot.act(game.controllerView(alice));
      if (action.type === "cast-spell") casts.push(bot.lastDecision?.via ?? "");
      game.dispatch(action);
    }
    // Searched once, at the first Ritual or at the pass to combat before it;
    // the casts after the first are the plan replayed.
    expect(casts).toHaveLength(3);
    expect(casts.slice(1)).toEqual(["turn plan replay", "turn plan replay"]);
  });

  it("plays on through our next turn: the second Bolt makes the first one's face the win", () => {
    const bolts = benchmark("two Bolts to the face over two turns");
    const report = runBenchmark(bolts, registry, (player) =>
      new EvalBotController(player, registry, { plan: "next-turn" }),
    );
    expect(report.passed, report.detail).toBe(true);
    const plain = runBenchmark(bolts, registry, planning);
    expect(plain.passed, "planning this turn alone Bolts the Bears").toBe(false);
  });
});

// Under a live room's clock (`timeBudgetMs`) the plan shares its decision's
// deadline: it stopped only once the deadline had passed, and ran 120 to 500ms
// past it on wide four-player boards (2026-10-18).
describe("replaying a plan's step", () => {
  // Goblin Engineer's return, planned at one artifact in the graveyard; the
  // real game (seed 84 of the strong-deck pilot) had a different one there,
  // and the replay aimed at a card still in the library.
  const engineerBoard = () => {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Mountain") })),
    });
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    game.state.zones.perPlayer[A].hand = [];
    const engineer = game.debugSpawn("Goblin Engineer", A, "battlefield", { summoningSick: false });
    const ring = game.debugSpawn("Sol Ring", A, "battlefield");
    game.debugSpawn("Mountain", A, "battlefield");
    const inGraveyard = game.debugSpawn("Liquimetal Torque", A, "graveyard");
    const inLibrary = game.debugSpawn("Liquimetal Torque", A, "library");
    return { game, engineer, ring, inGraveyard, inLibrary };
  };
  const planned = (engineer: ObjectId, ring: ObjectId, target: ObjectId): Action => ({
    type: "activate-ability",
    player: A,
    source: engineer,
    abilityIndex: 0,
    sacrifice: ring,
    targets: [{ kind: "object", object: target }],
  });
  const withPlan = (game: Game, step: Action): EvalBotController => {
    const bot = new EvalBotController(A, registry);
    (bot as unknown as { turnPlan: unknown }).turnPlan = {
      turn: game.state.turn.number,
      steps: [step],
      boards: [boardKey(game.state, A)],
    };
    return bot;
  };

  it("replays a step whose target is still on offer", () => {
    const { game, engineer, ring, inGraveyard } = engineerBoard();
    const step = planned(engineer, ring, inGraveyard);
    const bot = withPlan(game, step);
    expect(bot.act(game.controllerView(A))).toEqual(step);
  });

  it("drops a step whose target the real game put somewhere else", () => {
    const { game, engineer, ring, inLibrary } = engineerBoard();
    const action = withPlan(game, planned(engineer, ring, inLibrary)).act(game.controllerView(A));
    const aimed = action.type === "activate-ability" ? action.targets?.[0] : undefined;
    expect(aimed?.kind === "object" ? aimed.object : null).not.toBe(inLibrary);
    // Whatever it chose instead, the engine takes it.
    expect(() => game.dispatch(action)).not.toThrow();
  });
});

describe("a plan on the decision's clock", () => {
  const position = () => {
    const game = benchmark("two Rituals into Grave Titan").setup(registry);
    const me = game.state.turnOrder[0];
    game.advanceUntil((s) => s.priority.holder === me && s.turn.step === "precombat-main");
    const hooks: TurnPlanHooks = {
      moves: (board) =>
        board.legalActions().flatMap((l) => (l.kind === "pass-priority" ? [] : candidateActions(l, me))),
      value: (state) => state.zones.shared.battlefield.filter((id) => state.objects[id]?.controller === me).length,
      mayAttack: () => false,
    };
    const firsts = hooks.moves(game.controllerView(me));
    const plan = (clock?: PlanClock, simulations = 48, depth = 5, scored?: ReadonlyMap<Action, ScoredFirst>) =>
      planTurn(game.state, registry, me, firsts, hooks, { depth, beam: 3, simulations, clock }, undefined, false, scored);
    return Object.assign(plan, { firsts });
  };
  const steps = (lines: ReturnType<ReturnType<typeof position>>) =>
    lines.map((line) => line.steps.map((step) => (step === "combat" ? step : step.type)).join(" "));

  it("runs every simulation through it, and plans as it would without one", () => {
    const plan = position();
    let timed = 0;
    const clocked = plan({ out: () => false, timed: (simulate) => ((timed += 1), simulate()) });
    expect(timed).toBeGreaterThan(3);
    expect(steps(clocked)).toEqual(steps(plan()));
  });

  it("stops as soon as it says no other simulation fits", () => {
    const plan = position();
    let timed = 0;
    plan({ out: () => timed >= 2, timed: (simulate) => ((timed += 1), simulate()) });
    expect(timed).toBe(2);
  });

  // The bot audit's S4: a level resolved every move of every kept line
  // before scoring any, so a level the budget cut scored nothing.
  it("keeps the two-move line it had resolved when the simulations ran out", () => {
    const plan = position();
    // Each first move resolved and passed out, then two more: one second
    // move resolved, and passed out.
    const lines = plan(undefined, plan.firsts.length * 2 + 2);
    expect(lines.some((line) => line.steps.length === 2)).toBe(true);
  });

  it("takes the first moves the caller scored as lines, and rolls none of them out", () => {
    const plan = position();
    const scored = new Map<Action, ScoredFirst>();
    for (const line of plan(undefined, 48, 1)) {
      const step = line.steps[0];
      if (step !== undefined && step !== "combat") scored.set(step, { end: line.end, value: line.value });
    }
    expect(scored.size).toBe(plan.firsts.length);
    const count = (given?: ReadonlyMap<Action, ScoredFirst>) => {
      let timed = 0;
      const lines = plan({ out: () => false, timed: (simulate) => ((timed += 1), simulate()) }, 48, 5, given);
      return { timed, lines: steps(lines).sort() };
    };
    const own = count();
    const given = count(scored);
    expect(given.lines).toEqual(own.lines);
    expect(given.timed).toBeLessThanOrEqual(own.timed - plan.firsts.length);
  });
});
