/**
 * A die rerolled after the roll (rule 706.2b — `StaticAbility.rerollsRoll`,
 * `random-results.ts`'s `RollReroll`): Monitor Monitor's "Once each turn, you
 * may pay {1} to reroll one or more dice you rolled". Asked as a
 * `choose-modes` (`rerollRoll`, a mode a die) after the dice are thrown and
 * before anything reads them or any shift is offered; the roll happens once,
 * with the dice as rerolled.
 *
 * The dice come from the seeded stream, so a test finds a seed whose reroll
 * came up as it needs.
 */
import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { RollInProgress } from "../random-results.js";

import { A, lands, nextTurn, settle, spawn, table, type Table } from "./harness.js";

const rolls = (game: Game) => game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e] : []));

function asked(game: Game): { roll: RollInProgress; texts: readonly string[]; kind: "reroll" | "shift" } | undefined {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") return undefined;
  const texts = awaiting.modes.map((m) => m.text);
  if (awaiting.rerollRoll !== undefined) return { roll: awaiting.rerollRoll.roll, texts, kind: "reroll" };
  if (awaiting.shiftRoll !== undefined) return { roll: awaiting.shiftRoll.roll, texts, kind: "shift" };
  return undefined;
}

const choose = (game: Game, modes: readonly number[]): void => {
  game.dispatch({ type: "choose-modes", player: A, modes: [...modes] });
};

const D6: EffectSpec = { kind: "roll-dice", sides: 6 };
const roll = (game: Game, effect: EffectSpec = D6): void => game.debugApplyEffect(A, effect);

const untappedIslands = (game: Game): number =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Island" && !game.state.objects[id].tapped,
  ).length;

/** A table with `setup` done whose reroll, taken on `dice`, changes them. */
function rerolledDiffers(setup: (t: Table) => void, dice: readonly number[]): { t: Table; before: readonly number[] } {
  for (let seed = 1; seed < 500; seed += 1) {
    const t = table({ seed });
    setup(t);
    const question = asked(t.game);
    if (question?.kind !== "reroll") continue;
    const before = question.roll.results;
    choose(t.game, dice);
    const after = rolls(t.game).at(-1)?.results;
    if (after !== undefined && dice.every((d) => after[d] !== before[d])) return { t, before };
  }
  throw new Error("no seed rerolled that");
}

describe("Monitor Monitor", () => {
  it("pays {1} to reroll the die, and the roll happens once, as rerolled", () => {
    const { t, before } = rerolledDiffers((t) => {
      spawn(t.game, "Monitor Monitor");
      lands(t.game, "Island", 1);
      roll(t.game);
    }, [0]);
    const { game } = t;
    expect(rolls(game)).toHaveLength(1);
    expect(rolls(game)[0].results[0]).not.toBe(before[0]);
    expect(untappedIslands(game)).toBe(0);
    // Once each turn: the next roll this turn isn't offered it.
    roll(game);
    expect(asked(game)).toBeUndefined();
    expect(rolls(game)).toHaveLength(2);
  });

  it("offers the reroll with the die's result, and declining it pays nothing and keeps it for later", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    lands(game, "Island", 1);
    roll(game);
    const question = asked(game);
    expect(question?.kind).toBe("reroll");
    expect(question?.texts).toEqual([`Monitor Monitor: Pay {1} to reroll the ${question?.roll.results[0]}`]);
    choose(game, []);
    expect(asked(game)).toBeUndefined();
    expect(rolls(game)[0].results).toEqual(question?.roll.results);
    expect(untappedIslands(game)).toBe(1);
    // Not used: offered again on the next roll.
    roll(game);
    expect(asked(game)?.kind).toBe("reroll");
  });

  it("rerolls any number of a roll's dice for one payment", () => {
    const { t, before } = rerolledDiffers((t) => {
      spawn(t.game, "Monitor Monitor");
      lands(t.game, "Island", 1);
      roll(t.game, { kind: "roll-dice", sides: 6, count: 3 });
    }, [1]);
    const { game } = t;
    const results = rolls(game)[0].results;
    expect(results[0]).toBe(before[0]);
    expect(results[2]).toBe(before[2]);
    expect(results[1]).not.toBe(before[1]);
    expect(untappedIslands(game)).toBe(0);
  });

  it("asks each die of a roll as a mode", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    lands(game, "Island", 1);
    roll(game, { kind: "roll-dice", sides: 6, count: 2 });
    const question = asked(game);
    const [one, two] = question?.roll.results ?? [];
    expect(question?.texts).toEqual([
      `Monitor Monitor: Pay {1} to reroll die 1 (${one})`,
      `Monitor Monitor: Pay {1} to reroll die 2 (${two})`,
    ]);
  });

  it("isn't offered without the mana to pay", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    roll(game);
    expect(asked(game)).toBeUndefined();
    expect(rolls(game)).toHaveLength(1);
  });

  it("two of them may each reroll the same roll", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    spawn(game, "Monitor Monitor");
    lands(game, "Island", 2);
    roll(game);
    expect(asked(game)?.kind).toBe("reroll");
    choose(game, [0]);
    expect(asked(game)?.kind).toBe("reroll");
    choose(game, [0]);
    expect(asked(game)).toBeUndefined();
    expect(rolls(game)).toHaveLength(1);
    expect(untappedIslands(game)).toBe(0);
  });

  it("comes before a shift, which is offered on the rerolled die", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    spawn(game, "Night Shift of the Living Dead");
    lands(game, "Island", 1);
    roll(game);
    expect(asked(game)?.kind).toBe("reroll");
    choose(game, [0]);
    const shift = asked(game);
    expect(shift?.kind).toBe("shift");
    expect(rolls(game)).toHaveLength(0);
  });

  it("the bots answer it with a legal choice", () => {
    for (const bot of ["v1", "v2"] as const) {
      const { game } = table();
      spawn(game, "Monitor Monitor");
      lands(game, "Island", 1);
      roll(game);
      expect(asked(game)?.kind).toBe("reroll");
      const view = game.controllerView(A);
      const action =
        bot === "v1"
          ? new HeuristicBotController(A, game.registry).act(view)
          : new EvalBotController(A, game.registry, { maxSimulations: 8 }).act(view);
      expect(action.type).toBe("choose-modes");
      game.dispatch(action);
      expect(rolls(game)).toHaveLength(1);
    }
  });

  it("is used once each turn, and again the next", () => {
    const { game } = table();
    spawn(game, "Monitor Monitor");
    lands(game, "Island", 1);
    roll(game);
    choose(game, [0]);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    roll(game);
    expect(asked(game)?.kind).toBe("reroll");
  });
});
