/**
 * A die result shifted after the roll (rule 706.2a — `StaticAbility.shiftsRoll`,
 * `random-results.ts`'s `RollShift`): "After you roll a die, you may pay 1
 * life. If you do, increase or decrease the result by 1. Do this only once each
 * turn" (Night Shift of the Living Dead), "… you may remove a +1/+1 counter
 * from this creature. If you do, …" (Xenosquirrels). Asked as a `choose-modes`
 * (`shiftRoll`) after the dice are thrown and before anything reads them: the
 * `dice-rolled` event, the triggers, a results table, a roll to visit, a roll
 * as a permanent enters and stored results all see the shifted result.
 *
 * The dice come from the seeded stream, so each test finds a seed whose roll
 * came up as it needs (`rolledAs`), reading the dice off the question asked.
 */
import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { RollInProgress } from "../random-results.js";

import {
  A,
  B,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  lightUp,
  nextTurn,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  type Table,
} from "./harness.js";

const rolls = (game: Game) => game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e] : []));

/** The shift being asked, if one is. */
function shiftAsked(game: Game): { roll: RollInProgress; texts: readonly string[] } | undefined {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes" || awaiting.shiftRoll === undefined) return undefined;
  return { roll: awaiting.shiftRoll.roll, texts: awaiting.modes.map((m) => m.text) };
}

/** Answer the shift asked with the mode whose text is `text` (none for null). */
function answer(game: Game, text: string | null): void {
  const asked = shiftAsked(game);
  if (asked === undefined) throw new Error("no shift asked");
  const index = text === null ? -1 : asked.texts.indexOf(text);
  if (text !== null && index < 0) throw new Error(`no "${text}" among ${JSON.stringify(asked.texts)}`);
  game.dispatch({ type: "choose-modes", player: asked.roll.player, modes: index < 0 ? [] : [index] });
}

/** The first seed whose `setup` asks a shift of a roll that came up as
 * `want` says. */
function rolledAs(want: (results: readonly number[]) => boolean, setup: (t: Table) => void): Table {
  for (let seed = 1; seed < 3000; seed += 1) {
    const t = table({ seed });
    setup(t);
    const asked = shiftAsked(t.game);
    if (asked !== undefined && want(asked.roll.results)) return t;
  }
  throw new Error("no seed rolled that");
}

const D6: EffectSpec = { kind: "roll-dice", sides: 6 };
const roll = (game: Game, effect: EffectSpec = D6): void => game.debugApplyEffect(A, effect);

/** Cast it and let it resolve until something is asked. */
function castAndWait(game: Game, card: ObjectId, x?: number): void {
  cast(game, card, { settle: false, ...(x !== undefined ? { x } : {}) });
  game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length === 0);
}

const idOf = (game: Game, name: string): ObjectId => {
  const found = Object.values(game.state.objects).find((o) => o.cardName === name);
  if (found === undefined) throw new Error(`no ${name}`);
  return found.id;
};

describe("Night Shift of the Living Dead", () => {
  it("a 5 is offered as a 6 or a 4 for 1 life; made a 6, it's a 6 that was rolled", () => {
    const { game } = rolledAs(
      (r) => r[0] === 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game);
      },
    );
    // Nothing has read the roll yet (rule 706.2): no event, no trigger.
    expect(rolls(game)).toHaveLength(0);
    expect(shiftAsked(game)?.texts).toEqual(["Pay 1 life: 5 → 6", "Pay 1 life: 5 → 4"]);
    answer(game, "Pay 1 life: 5 → 6");
    expect(life(game)).toBe(19);
    const [rolled] = rolls(game);
    expect(rolled.results).toEqual([5]);
    expect(rolled.shifts).toEqual([1]);
    settle(game);
    // "Whenever you roll a 6" reads the result, modifiers included.
    expect(tokensNamed(game, "Zombie Employee Token", A)).toBe(1);
  });

  it("a natural 6 moved down to 5 isn't a 6; one left alone is", () => {
    const down = rolledAs(
      (r) => r[0] === 6,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game);
      },
    ).game;
    answer(down, "Pay 1 life: 6 → 5");
    settle(down);
    expect(tokensNamed(down, "Zombie Employee Token", A)).toBe(0);

    const kept = rolledAs(
      (r) => r[0] === 6,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game);
      },
    ).game;
    answer(kept, null);
    settle(kept);
    expect(life(kept)).toBe(20);
    expect(rolls(kept)[0].shifts).toBeUndefined();
    expect(tokensNamed(kept, "Zombie Employee Token", A)).toBe(1);
  });

  it("only once each turn: done, the next roll isn't asked; declined, it is; next turn, again", () => {
    const { game } = rolledAs(
      () => true,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game);
      },
    );
    // Declining isn't doing it.
    answer(game, null);
    roll(game);
    const asked = shiftAsked(game);
    expect(asked).toBeDefined();
    answer(game, asked?.texts[0] ?? null);
    expect(life(game)).toBe(19);
    roll(game);
    expect(shiftAsked(game)).toBeUndefined();
    expect(rolls(game)).toHaveLength(3);
    // Each turn: bob's turn is a turn too.
    settle(game);
    nextTurn(game);
    roll(game);
    expect(shiftAsked(game)).toBeDefined();
  });

  it("only its controller's rolls", () => {
    const { game } = table();
    spawn(game, "Night Shift of the Living Dead", B);
    roll(game);
    expect(shiftAsked(game)).toBeUndefined();
    expect(rolls(game)).toHaveLength(1);
  });

  it("several dice: every result seen, one die shifted, die by die", () => {
    const { game } = rolledAs(
      (r) => r.length === 2 && r[0] !== r[1],
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game, { kind: "roll-dice", sides: 6, count: 2 });
      },
    );
    const [first, second] = shiftAsked(game)?.roll.results ?? [];
    expect(shiftAsked(game)?.texts).toEqual([
      `Pay 1 life: die 1, ${first} → ${first + 1}`,
      `Pay 1 life: die 1, ${first} → ${first - 1}`,
      `Pay 1 life: die 2, ${second} → ${second + 1}`,
      `Pay 1 life: die 2, ${second} → ${second - 1}`,
    ]);
    answer(game, `Pay 1 life: die 2, ${second} → ${second - 1}`);
    // Once each turn: the other die isn't offered.
    expect(shiftAsked(game)).toBeUndefined();
    expect(rolls(game)[0].shifts).toEqual([0, -1]);
  });

  it("two dice alike are one choice", () => {
    const { game } = rolledAs(
      (r) => r.length === 2 && r[0] === r[1],
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game, { kind: "roll-dice", sides: 6, count: 2 });
      },
    );
    expect(shiftAsked(game)?.texts).toHaveLength(2);
  });

  it("a results table reads the shifted result, and the steps after the roll wait for it", () => {
    const effect: EffectSpec = {
      kind: "sequence",
      effects: [
        {
          kind: "roll-dice",
          sides: 6,
          table: [
            { min: 1, max: 5, effect: { kind: "gain-life", amount: 1 } },
            { min: 6, effect: { kind: "gain-life", amount: 10 } },
          ],
        },
        { kind: "draw", amount: 1 },
      ],
    };
    const { game } = rolledAs(
      (r) => r[0] === 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game, effect);
      },
    );
    const before = hand(game).length;
    // Rule 608.2c: the draw waits on the roll.
    expect(hand(game).length).toBe(before);
    answer(game, "Pay 1 life: 5 → 6");
    settle(game);
    expect(life(game)).toBe(20 - 1 + 10);
    expect(hand(game).length).toBe(before + 1);
  });

  it("a roll to visit: the shifted result is the one visited", () => {
    const { game } = rolledAs(
      (r) => r[0] === 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        const booth = spawn(game, "Information Booth");
        lightUp(game, booth, [6]);
        game.debugApplyEffect(A, { kind: "roll-to-visit" });
      },
    );
    const before = hand(game).length;
    answer(game, "Pay 1 life: 5 → 6");
    settle(game);
    // Information Booth's visit: draw a card.
    expect(hand(game).length).toBe(before + 1);
    const visited = game.state.eventLog.find((e) => e.type === "rolled-to-visit");
    expect(visited?.type === "rolled-to-visit" ? visited.result : undefined).toBe(6);
  });

  it("a roll as a permanent enters (Neverwinter Hydra): it enters with the shifted total", () => {
    const { game } = rolledAs(
      (r) => r[0] === 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        lands(game, "Forest", 4);
        castAndWait(game, toHand(game, "Neverwinter Hydra"), 1);
      },
    );
    const hydra = idOf(game, "Neverwinter Hydra");
    // Not on the battlefield yet: the roll is part of how it enters.
    expect(game.state.objects[hydra].zone).toBe("stack");
    answer(game, "Pay 1 life: 5 → 6");
    settle(game);
    expect(game.state.objects[hydra].zone).toBe("battlefield");
    expect(counters(game, hydra)).toBe(6);
    expect(tokensNamed(game, "Zombie Employee Token", A)).toBe(1);
  });

  it("stored results are stored shifted (Centaur of Attention), stored and rerolled", () => {
    const { game, a } = rolledAs(
      (r) => r.length === 5 && r[0] < 6,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        enter(game, "Centaur of Attention", A, { settle: false });
        game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length === 0);
      },
    );
    const centaur = idOf(game, "Centaur of Attention");
    const first = shiftAsked(game)?.roll.results[0] ?? 0;
    answer(game, `Pay 1 life: die 1, ${first} → ${first + 1}`);
    settle(game);
    expect(game.state.objects[centaur].storedResults?.[0]).toEqual({ sides: 6, result: first + 1 });
    // Next turn's combat: reroll the first, and shift the new one down.
    nextTurn(game);
    nextTurn(game);
    a.chooseModesFn = (_view, _min, _max, texts) => (texts[0]?.startsWith("Reroll") === true ? [0] : []);
    toStep(game, "begin-combat");
    game.advanceUntil((s) => shiftAsked(game) !== undefined || (s.zones.shared.stack.length === 0 && s.turn.step !== "begin-combat"));
    const asked = shiftAsked(game);
    expect(asked?.roll.results).toHaveLength(1);
    const rerolled = asked?.roll.results[0] ?? 0;
    answer(game, `Pay 1 life: ${rerolled} → ${rerolled - 1}`);
    expect(game.state.objects[centaur].storedResults?.[0]).toEqual({ sides: 6, result: rerolled - 1 });
  });

  it("a mana ability's roll paying for a spell (Vexing Puzzlebox): asked once the spell is cast", () => {
    const { game } = rolledAs(
      (r) => r[0] < 20,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        spawn(game, "Vexing Puzzlebox");
        cast(game, toHand(game, "Llanowar Elves"), { settle: false });
      },
    );
    const box = idOf(game, "Vexing Puzzlebox");
    expect(game.state.objects[box].tapped).toBe(true);
    expect(game.state.objects[idOf(game, "Llanowar Elves")].zone).toBe("stack");
    const natural = shiftAsked(game)?.roll.results[0] ?? 0;
    answer(game, `Pay 1 life: ${natural} → ${natural + 1}`);
    settle(game);
    // "Whenever you roll one or more dice, put … charge counters … equal to the result."
    expect(counters(game, box, "charge")).toBe(natural + 1);
    expect(game.state.objects[idOf(game, "Llanowar Elves")].zone).toBe("battlefield");
  });

  it("\"choose one result\" chooses among the shifted results (Reckless Endeavor)", () => {
    const { game, a } = rolledAs(
      (r) => r.length === 2 && r[0] === 5 && r[1] !== 6 && r[1] !== 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        lands(game, "Mountain", 7);
        castAndWait(game, toHand(game, "Reckless Endeavor"));
      },
    );
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return options[0];
    };
    answer(game, "Pay 1 life: die 1, 5 → 6");
    settle(game);
    expect(offered).toContain("6");
    expect(offered).not.toContain("5");
  });
});

describe("Xenosquirrels", () => {
  it("a +1/+1 counter for each shift, each die once, no turn limit", () => {
    const { game } = rolledAs(
      (r) => r.length === 2 && r[0] !== r[1],
      ({ game }) => {
        const squirrels = spawn(game, "Xenosquirrels");
        game.state.objects[squirrels].counters = { "+1/+1": 2 };
        roll(game, { kind: "roll-dice", sides: 6, count: 2 });
      },
    );
    const squirrels = idOf(game, "Xenosquirrels");
    const [first, second] = shiftAsked(game)?.roll.results ?? [];
    answer(game, `Remove a +1/+1 counter: die 1, ${first} → ${first + 1}`);
    expect(counters(game, squirrels)).toBe(1);
    // Die 1 had its chance; die 2 hasn't.
    expect(shiftAsked(game)?.texts).toEqual([
      `Remove a +1/+1 counter: die 2, ${second} → ${second + 1}`,
      `Remove a +1/+1 counter: die 2, ${second} → ${second - 1}`,
    ]);
    answer(game, `Remove a +1/+1 counter: die 2, ${second} → ${second + 1}`);
    expect(counters(game, squirrels)).toBe(0);
    expect(rolls(game)[0].shifts).toEqual([1, 1]);
    // Another roll the same turn, and no counter left: nothing is asked.
    roll(game);
    expect(shiftAsked(game)).toBeUndefined();
  });

  it("enters with two +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const squirrels = toHand(game, "Xenosquirrels");
    cast(game, squirrels);
    expect(counters(game, squirrels)).toBe(2);
  });

  it("with Night Shift: both offered, by name, and both may move the same die", () => {
    const { game } = rolledAs(
      (r) => r[0] === 4,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        const squirrels = spawn(game, "Xenosquirrels");
        game.state.objects[squirrels].counters = { "+1/+1": 2 };
        roll(game);
      },
    );
    expect(shiftAsked(game)?.texts).toEqual([
      "Night Shift of the Living Dead: Pay 1 life: 4 → 5",
      "Night Shift of the Living Dead: Pay 1 life: 4 → 3",
      "Xenosquirrels: Remove a +1/+1 counter: 4 → 5",
      "Xenosquirrels: Remove a +1/+1 counter: 4 → 3",
    ]);
    answer(game, "Xenosquirrels: Remove a +1/+1 counter: 4 → 5");
    // The die shows 5 now; Night Shift's choice reads it so.
    expect(shiftAsked(game)?.texts).toEqual(["Pay 1 life: 5 → 6", "Pay 1 life: 5 → 4"]);
    answer(game, "Pay 1 life: 5 → 6");
    settle(game);
    expect(rolls(game)[0].shifts).toEqual([2]);
    expect(tokensNamed(game, "Zombie Employee Token", A)).toBe(1);
  });
});

describe("the bots", () => {
  const fiveOnNightShift = (): Game =>
    rolledAs(
      (r) => r[0] === 5,
      ({ game }) => {
        spawn(game, "Night Shift of the Living Dead");
        roll(game);
      },
    ).game;

  it("v1 answers it: declining, a shift being worth nothing it can read", () => {
    const game = fiveOnNightShift();
    const action = new HeuristicBotController(A, game.registry).act(game.controllerView(A));
    expect(action).toMatchObject({ type: "choose-modes", player: A, modes: [] });
    game.dispatch(action);
    expect(rolls(game)).toHaveLength(1);
  });

  it("v2 plays each answer out: 1 life for a 2/2 Zombie Employee", () => {
    const game = fiveOnNightShift();
    const action = new EvalBotController(A, game.registry, { maxSimulations: 8 }).act(game.controllerView(A));
    expect(action).toMatchObject({ type: "choose-modes", player: A, modes: [0] });
  });
});
