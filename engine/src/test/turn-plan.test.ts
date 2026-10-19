import { describe, expect, it } from "vitest";

import { BOT_BENCHMARKS, runBenchmark } from "../bot/benchmarks.js";
import { candidateActions } from "../bot/candidates.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { planTurn, type PlanClock, type TurnPlanHooks } from "../bot/turn-plan.js";
import { createDefaultRegistry } from "../cards.js";
import type { PlayerId } from "../primitives.js";

const registry = createDefaultRegistry();

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
    const plan = (clock?: PlanClock) =>
      planTurn(game.state, registry, me, firsts, hooks, { depth: 5, beam: 3, simulations: 48, clock });
    return plan;
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
});
