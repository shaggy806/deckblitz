import { describe, expect, it } from "vitest";

import { BOT_BENCHMARKS } from "../bot/benchmarks.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const alice = asPlayerId("alice");

// The deep horizons are an experiment (`Horizon` in `bot/simulate.ts`), but
// the one decision only they search — rule 903.9a — has a measured trap
// (`decisions/commander-replacement.ts`): with no command-zone term in the
// evaluation, a commander left in the graveyard for nothing scores a hair
// better than one saved. `COMMANDER_STAYS_MARGIN` is the guard.
describe("the next-turn horizon's commander choice", () => {
  const zombify = BOT_BENCHMARKS.find((b) => b.name === "lets the commander die into a Zombify");
  if (zombify === undefined) throw new Error("no Zombify benchmark");

  const answer = (withZombify: boolean): unknown => {
    const game = zombify.setup(registry);
    if (!withZombify) game.state.zones.perPlayer[alice].hand = [];
    expect(game.state.awaiting?.kind).toBe("commander-replacement");
    const bot = new EvalBotController(alice, registry, { horizon: "next-turn" });
    return bot.act(game.controllerView(alice));
  };

  it("leaves Sheoldred in the graveyard for the Zombify in hand", () => {
    expect(answer(true)).toMatchObject({ type: "commander-replacement", toCommandZone: false });
  });

  it("sends her to the command zone with no way back", () => {
    expect(answer(false)).toMatchObject({ type: "commander-replacement", toCommandZone: true });
  });

  it("isn't searched at the default horizon", () => {
    const game = zombify.setup(registry);
    const bot = new EvalBotController(alice, registry);
    expect(bot.act(game.controllerView(alice))).toMatchObject({ toCommandZone: true });
  });
});
