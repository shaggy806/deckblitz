/**
 * A roll replaced by one more die, of which the replacement's controller
 * ignores one of their choice (rule 706.6 — a `would-roll-dice`
 * replacement's `ignoreChosen`): Bamboozling Beeble's "the next time target
 * player would roll one or more dice this turn, instead they roll that many
 * dice plus one and you choose one of those rolls to ignore". Asked once the
 * dice are thrown (its ruling: after seeing all the results), before any
 * reroll or shift; what's ignored never happened. Used up by the roll it
 * applies to, and gone at end of turn.
 */
import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, activate, B, lands, nextTurn, ref, spawn, table, type Table } from "./harness.js";

const rolls = (game: Game) => game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e] : []));
const D6: EffectSpec = { kind: "roll-dice", sides: 6 };
const roll = (game: Game, player: PlayerId = B, effect: EffectSpec = D6): void => game.debugApplyEffect(player, effect);

function ignoreAsked(game: Game): { player: PlayerId; dice: readonly number[]; texts: readonly string[] } | undefined {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes" || awaiting.ignoreRoll === undefined) return undefined;
  return { player: awaiting.player, dice: awaiting.ignoreRoll.dice, texts: awaiting.modes.map((m) => m.text) };
}

/** Alice's Beeble aimed at `at`, then `at` rolls: a table whose two dice differ. */
function beebledRoll(at: PlayerId = B, effect: EffectSpec = D6): Table {
  for (let seed = 1; seed < 200; seed += 1) {
    const t = table({ seed });
    const beeble = spawn(t.game, "Bamboozling Beeble");
    lands(t.game, "Island", 1);
    activate(t.game, beeble, 0, { targets: [ref(at)] });
    roll(t.game, at, effect);
    if (ignoreAsked(t.game) !== undefined) return t;
  }
  throw new Error("no seed threw two different dice");
}

describe("Bamboozling Beeble", () => {
  it("adds a die to the target player's next roll, and its controller ignores one they choose", () => {
    const { game } = beebledRoll();
    const question = ignoreAsked(game);
    expect(question?.player).toBe(A);
    expect(question?.dice).toHaveLength(2);
    expect(question?.texts.every((t) => /^Ignore the \d+ they rolled$/.test(t))).toBe(true);
    // Nothing has been rolled yet: the roll waits on the choice.
    expect(rolls(game)).toHaveLength(0);
    const high = Math.max(...(question?.dice ?? []));
    const low = Math.min(...(question?.dice ?? []));
    game.dispatch({ type: "choose-modes", player: A, modes: [question?.dice.indexOf(high) ?? 0] });
    const [rolled] = rolls(game);
    expect(rolled.player).toBe(B);
    expect(rolled.results).toEqual([low]);
    expect(rolled.ignored).toEqual([high]);
    expect(game.state.awaiting).toBeNull();
  });

  it("is used up by that roll: the next is one die, asked nothing", () => {
    const { game } = beebledRoll();
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    roll(game);
    expect(ignoreAsked(game)).toBeUndefined();
    expect(rolls(game)[1].results).toHaveLength(1);
    expect(rolls(game)[1].ignored).toBeUndefined();
  });

  it("doesn't touch another player's roll, and ends with the turn", () => {
    const { game } = table();
    const beeble = spawn(game, "Bamboozling Beeble");
    lands(game, "Island", 1);
    activate(game, beeble, 0, { targets: [ref(B)] });
    roll(game, A);
    expect(ignoreAsked(game)).toBeUndefined();
    expect(rolls(game)[0].results).toHaveLength(1);
    nextTurn(game);
    roll(game, B);
    expect(ignoreAsked(game)).toBeUndefined();
    expect(rolls(game)[1].results).toHaveLength(1);
  });

  it("keeps the dice called for: two called, three thrown, one ignored", () => {
    const { game } = beebledRoll(B, { kind: "roll-dice", sides: 20, count: 2 });
    const question = ignoreAsked(game);
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    const [rolled] = rolls(game);
    expect(rolled.results).toHaveLength(2);
    expect(rolled.ignored).toEqual([question?.dice[0]]);
  });

  it("the bots answer it with a legal choice", () => {
    for (const bot of ["v1", "v2"] as const) {
      const { game } = beebledRoll();
      const view = game.controllerView(A);
      const action =
        bot === "v1"
          ? new HeuristicBotController(A, game.registry).act(view)
          : new EvalBotController(A, game.registry, { maxSimulations: 8 }).act(view);
      expect(action.type).toBe("choose-modes");
      game.dispatch(action);
      expect(rolls(game)).toHaveLength(1);
      expect(rolls(game)[0].results).toHaveLength(1);
    }
  });
});
