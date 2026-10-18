import { describe, expect, it } from "vitest";

import { BOT_BENCHMARKS, playLine, runBenchmark } from "../bot/benchmarks.js";
import { createDefaultRegistry } from "../cards.js";

const registry = createDefaultRegistry();

// The benchmarks are goals, not a gate: nothing here asks the bot to solve
// one. What it checks is that each is a fair goal — its winning line, played
// by script against the same v2 opponents, does win, and its natural mistake
// doesn't — so a benchmark can't be unsolvable, or pass on a judge that
// can't fail.
describe("bot benchmarks", () => {
  for (const benchmark of BOT_BENCHMARKS) {
    describe(benchmark.name, () => {
      it("is won by its winning line", () => {
        const report = runBenchmark(benchmark, registry, playLine(benchmark.solution));
        expect(report.passed, report.detail).toBe(true);
      });

      it("is lost by its mistake", () => {
        const report = runBenchmark(benchmark, registry, playLine(benchmark.mistake));
        expect(report.passed, report.detail).toBe(false);
        expect(report.detail).not.toMatch(/^threw/);
      });
    });
  }

  it("have distinct names", () => {
    expect(new Set(BOT_BENCHMARKS.map((b) => b.name)).size).toBe(BOT_BENCHMARKS.length);
  });
});
