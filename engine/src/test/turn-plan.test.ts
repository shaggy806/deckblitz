import { describe, expect, it } from "vitest";

import { BOT_BENCHMARKS, runBenchmark } from "../bot/benchmarks.js";
import { EvalBotController } from "../bot/eval-bot.js";
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
