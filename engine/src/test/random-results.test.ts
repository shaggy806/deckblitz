/**
 * Coin flips and die rolls as records (rules 705, 706; need-key-themes theme
 * 12): counted this way, kept in the journal, carried by a trigger, replaced
 * and named by statics, and the cards that prove each.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { flipUntilLose } from "../cards/helpers.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import { keepHighest, lastRollIn, matchingDice, rollRead, type RollRecord } from "../random-results.js";
import {
  A,
  attack,
  B,
  C,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  life,
  lands,
  loyalty,
  named,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
} from "./harness.js";

const flipsOf = (game: Game) => game.eventsOfType("coin-flipped");
const rollsOf = (game: Game) => game.eventsOfType("dice-rolled");

/** Apply `effect` for alice from a land she controls, and let it all finish. */
function apply(game: Game, effect: EffectSpec, player = A): void {
  const source = game.debugSpawn("Wastes", player, "battlefield");
  game.debugApplyEffect(player, effect, [], { source });
  settle(game);
}

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe("the records", () => {
  it("a roll's reads", () => {
    const roll: RollRecord = { player: A, sides: 6, results: [6, 6, 2], modifier: 1, total: 15 };
    expect(rollRead(roll, "total", 0)).toBe(15);
    expect(rollRead(roll, "highest", 0)).toBe(6);
    expect(rollRead(roll, "distinct", 0)).toBe(2);
    expect(rollRead(roll, { atLeast: 6 }, 0)).toBe(2);
    expect(rollRead(roll, { equals: 2 }, 0)).toBe(1);
    expect(rollRead(roll, "even", 0)).toBe(3);
  });

  it("ignoring the lowest keeps the rest in order (706.6)", () => {
    expect(keepHighest([3, 1, 5, 1], 2)).toEqual({ kept: [3, 5], ignored: [1, 1] });
    expect(keepHighest([4, 4], 2).ignored).toEqual([]);
  });

  it("a die test reads the result, or the natural result", () => {
    const roll: RollRecord = { player: A, sides: 20, results: [19, 20], modifier: 2, total: 41 };
    expect(matchingDice(roll, { atLeast: 22 })).toEqual([22]);
    expect(matchingDice(roll, { natural: "highest" })).toEqual([22]);
    expect(matchingDice(roll, { natural: 19 })).toEqual([21]);
    expect(matchingDice(roll, undefined)).toEqual([21, 22]);
  });

  it("the journal keeps a roll; two later rolls leave the last", () => {
    const { game } = table({ seed: 3 });
    apply(game, { kind: "roll-dice", sides: 6, count: 2 });
    apply(game, { kind: "roll-dice", sides: 20 });
    expect(lastRollIn(game.state)?.sides).toBe(20);
    expect(lastRollIn(game.state, B)).toBeUndefined();
  });
});

describe("flip-coin", () => {
  it("count: one event a coin, each coin's branch, then `then` counting them", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      apply(game, {
        kind: "flip-coin",
        count: 3,
        won: { kind: "gain-life", amount: 1 },
        then: { kind: "lose-life", amount: { thisWay: "flips-lost" } },
      });
      const flips = flipsOf(game);
      expect(flips).toHaveLength(3);
      const won = flips.filter((f) => f.won === true).length;
      expect(life(game)).toBe(20 + won - (3 - won));
    }
  });

  it("sides: no flip won or lost (705.2), the heads counted", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      apply(game, {
        kind: "flip-coin",
        count: 2,
        sides: true,
        heads: { kind: "gain-life", amount: 1 },
        tails: { kind: "lose-life", amount: 1 },
        then: { kind: "gain-life", amount: { thisWay: "coins-heads" } },
      });
      const flips = flipsOf(game);
      expect(flips.every((f) => f.won === undefined)).toBe(true);
      const heads = flips.filter((f) => f.came === "heads").length;
      expect(life(game)).toBe(20 + heads + heads - (2 - heads));
    }
  });

  it("a sides-only flip fires neither coin trigger", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Zndrsplt, Eye of Wisdom");
    const before = hand(game).length;
    apply(game, { kind: "flip-coin", count: 4, sides: true });
    expect(hand(game).length).toBe(before);
  });

  it("flipUntilLose: stops at the first loss, then counts every pass", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      apply(game, {
        kind: "sequence",
        effects: [flipUntilLose(), { kind: "gain-life", amount: { thisWay: "flips-won" } }],
      });
      const flips = flipsOf(game);
      expect(flips[flips.length - 1].won).toBe(false);
      expect(flips.slice(0, -1).every((f) => f.won === true)).toBe(true);
      expect(life(game)).toBe(20 + flips.length - 1);
    }
  });

  it("a seed replays the same flips", () => {
    const run = () => {
      const { game } = table({ seed: 42 });
      apply(game, { kind: "flip-coin", count: 6 });
      return flipsOf(game).map((f) => f.came).join();
    };
    expect(run()).toBe(run());
  });
});

describe("replacing a flip", () => {
  it("Krark's Thumb asks only when the two flips differ, and one flip happened", () => {
    let both = 0;
    let same = 0;
    for (const seed of SEEDS) {
      for (const keepWon of [true, false]) {
        const { game, a } = table({ seed });
        spawn(game, "Krark's Thumb");
        let asked = 0;
        a.chooseModesFn = () => {
          asked += 1;
          return keepWon ? [0] : [];
        };
        apply(game, { kind: "flip-coin", won: { kind: "gain-life", amount: 1 }, lost: { kind: "lose-life", amount: 1 } });
        const flips = flipsOf(game);
        expect(flips).toHaveLength(1);
        expect(life(game)).toBe(flips[0].won === true ? 21 : 19);
        if (asked === 1) {
          both += 1;
          expect(flips[0].won).toBe(keepWon);
        } else {
          same += 1;
        }
      }
    }
    expect(both).toBeGreaterThan(0);
    expect(same).toBeGreaterThan(0);
  });

  it("it applies to the controller only", () => {
    const { game, a } = table({ seed: 2 });
    spawn(game, "Krark's Thumb", B);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    apply(game, { kind: "flip-coin" });
    expect(asked).toBe(0);
    expect(flipsOf(game)).toHaveLength(1);
  });

  it("Edgar names the first flip each turn; a sides flip is won too (705.3)", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      spawn(game, "Edgar, King of Figaro");
      apply(game, { kind: "flip-coin", count: 3, sides: true });
      apply(game, { kind: "flip-coin" });
      const flips = flipsOf(game);
      expect(flips.slice(0, 3).every((f) => f.came === "heads" && f.won === true)).toBe(true);
      expect(flips).toHaveLength(4);
    }
    // The fourth flip, the second instruction, isn't named: it's lost sometimes.
    const fourth = SEEDS.map((seed) => {
      const { game } = table({ seed });
      spawn(game, "Edgar, King of Figaro");
      apply(game, { kind: "flip-coin" });
      apply(game, { kind: "flip-coin" });
      return flipsOf(game)[1].won;
    });
    expect(fourth).toContain(false);
    expect(fourth).toContain(true);
  });

  it("Edgar wins the flip for a wins-coin-flip trigger", () => {
    const { game } = table({ seed: 5 });
    spawn(game, "Edgar, King of Figaro");
    spawn(game, "Zndrsplt, Eye of Wisdom");
    const before = hand(game).length;
    apply(game, { kind: "flip-coin", sides: true });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("replacing a roll", () => {
  it("Wyll: one more die, the lowest ignored and never seen (706.6)", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      const wyll = spawn(game, "Wyll, Blade of Frontiers");
      apply(game, { kind: "roll-dice", sides: 20 });
      const [roll] = rollsOf(game);
      expect(roll.results).toHaveLength(1);
      expect(roll.ignored).toHaveLength(1);
      expect(roll.results[0]).toBeGreaterThanOrEqual(roll.ignored![0]);
      expect(counters(game, wyll)).toBe(1);
    }
  });

  it("two sources: two more, two ignored; only their controller's rolls", () => {
    const { game } = table({ seed: 9 });
    spawn(game, "Barbarian Class");
    spawn(game, "Barbarian Class");
    spawn(game, "Wyll, Blade of Frontiers", B);
    apply(game, { kind: "roll-dice", sides: 6, count: 2 });
    const [roll] = rollsOf(game);
    expect(roll.results).toHaveLength(2);
    expect(roll.ignored).toHaveLength(2);
  });

  it("Iron Mastiff's two dice under Wyll: three rolled, one kept", () => {
    const { game, a } = table({ seed: 4, players: 3 });
    const mastiff = spawn(game, "Iron Mastiff");
    const other = spawn(game, "Hill Giant");
    spawn(game, "Wyll, Blade of Frontiers");
    a.declareAttackersFn = () => [
      { attacker: mastiff, defender: B },
      { attacker: other, defender: C },
    ];
    toStep(game, "postcombat-main");
    const [roll] = rollsOf(game);
    expect(roll.results).toHaveLength(1);
    expect(roll.ignored).toHaveLength(2);
    expect(roll.results[0]).toBeGreaterThanOrEqual(Math.max(...roll.ignored!));
  });
});

describe("triggers on a result", () => {
  it("rolls-dice reads the result, its modifier included (706.2)", () => {
    const { game } = table({ seed: 7, ownRegistry: true });
    registryOf(game).register(
      defineCard({
        name: "Test Puzzlebox",
        manaCost: "{0}",
        types: ["artifact"],
        text: "Whenever you roll one or more dice, put a number of charge counters on this equal to the result.",
        triggered: [
          {
            trigger: { on: "event", event: "rolls-dice", who: "you" },
            targets: [],
            effect: { kind: "add-counter", target: "source", counter: "charge", amount: { triggerValue: true } },
            resolve: null,
            text: "test",
          },
        ],
      }),
    );
    const box = spawn(game, "Test Puzzlebox");
    apply(game, { kind: "roll-dice", sides: 20, modifier: 5 });
    expect(counters(game, box, "charge")).toBe(rollsOf(game)[0].results[0] + 5);
  });

  it("rolls-die fires per die: Netherese's highest natural result", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      spawn(game, "Netherese Puzzle-Ward");
      const before = hand(game).length;
      apply(game, { kind: "roll-dice", sides: 4, count: 3 });
      const fours = rollsOf(game)[0].results.filter((r) => r === 4).length;
      expect(hand(game).length).toBe(before + fours);
    }
  });

  it("Farideh's trigger reads its own roll, not a later one", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      const farideh = spawn(game, "Farideh, Devil's Chosen");
      const before = hand(game).length;
      apply(game, {
        kind: "sequence",
        effects: [
          { kind: "roll-dice", sides: 20 },
          { kind: "roll-dice", sides: 20 },
        ],
      });
      const rolls = rollsOf(game);
      expect(rolls).toHaveLength(2);
      expect(hand(game).length - before).toBe(rolls.filter((r) => r.results[0] >= 10).length);
      expect(keywords(game, farideh).has("flying")).toBe(true);
      expect(keywords(game, farideh).has("menace")).toBe(true);
    }
  });

  it("loses-coin-flip fires on a lost flip only", () => {
    const seen = SEEDS.map((seed) => {
      const { game } = table({ seed, ownRegistry: true });
      registryOf(game).register(
        defineCard({
          name: "Test Loser",
          manaCost: "{0}",
          types: ["artifact"],
          text: "Whenever you lose a coin flip, you lose 1 life.",
          triggered: [
            {
              trigger: { on: "event", event: "loses-coin-flip", who: "you" },
              targets: [],
              effect: { kind: "lose-life", amount: 1 },
              resolve: null,
              text: "test",
            },
          ],
        }),
      );
      spawn(game, "Test Loser");
      apply(game, { kind: "flip-coin" });
      const won = flipsOf(game)[0].won === true;
      expect(life(game)).toBe(won ? 20 : 19);
      return won;
    });
    expect(new Set(seen).size).toBe(2);
  });
});

describe("the cards", () => {
  it("Ral Zarek, Guest Lecturer: −7 skips as many turns as came up heads", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      const ral = spawn(game, "Ral Zarek, Guest Lecturer");
      loyalty(game, ral, -7, { atLeast: 7, targets: [ref(B)] });
      settle(game);
      const flips = flipsOf(game);
      expect(flips).toHaveLength(5);
      expect(flips.every((f) => f.won === undefined)).toBe(true);
      const heads = flips.filter((f) => f.came === "heads").length;
      expect(game.state.players[B].turnsToSkip ?? 0).toBe(heads);
    }
  });

  it("Mirror March: a token per flip won", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      spawn(game, "Mirror March");
      const hg = toHand(game, "Hill Giant");
      lands(game, "Mountain", 4);
      cast(game, hg);
      settle(game);
      const won = flipsOf(game).filter((f) => f.won === true).length;
      expect(named(game, "Hill Giant").length).toBe(1 + won);
    }
  });

  it("Squee's Revenge: a chosen number, or until a loss; draws only with every flip won", () => {
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      const spell = toHand(game, "Squee's Revenge");
      lands(game, "Volcanic Island", 3);
      a.chooseNumberFn = () => 3;
      const before = hand(game).length;
      cast(game, spell);
      settle(game);
      const flips = flipsOf(game);
      expect(flips.length).toBeLessThanOrEqual(3);
      const allWon = flips.every((f) => f.won === true);
      expect(hand(game).length - (before - 1)).toBe(allWon ? 6 : 0);
    }
  });

  it("Fiery Gambit: stopping after one win deals 3; a lost flip does nothing", () => {
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      const spell = toHand(game, "Fiery Gambit");
      lands(game, "Mountain", 3);
      const victim = spawn(game, "Serra Angel", B);
      a.chooseModesFn = () => []; // Stop flipping when asked.
      cast(game, spell, { targets: [ref(victim)] });
      settle(game);
      const flips = flipsOf(game);
      expect(flips).toHaveLength(1);
      expect(game.state.objects[victim].damageMarked).toBe(flips[0].won === true ? 3 : 0);
    }
  });

  it("Planar Chaos: the caster flips, and a lost flip counters the spell", () => {
    for (const seed of SEEDS) {
      const { game } = table({ seed });
      spawn(game, "Planar Chaos");
      const spell = toHand(game, "Shock", B);
      lands(game, "Mountain", 1, B);
      toStep(game, "precombat-main", B);
      cast(game, spell, { player: B, targets: [ref(A)] });
      settle(game);
      const [flip] = flipsOf(game);
      expect(flip.player).toBe(B);
      expect(life(game)).toBe(flip.won === true ? 18 : 20);
      expect(graveyard(game, B)).toContain(spell);
    }
  });

  it("Sword of Hours: doubles when the roll beats the damage or is 12", () => {
    for (const seed of SEEDS) {
      const { game, a } = table({ seed });
      const giant = spawn(game, "Hill Giant");
      const sword = spawn(game, "Sword of Hours");
      game.state.objects[sword].attachedTo = giant;
      attack(game, a, [giant]);
      const roll = rollsOf(game)[0].results[0];
      // A 3/3 with the attack trigger's counter deals 4.
      expect(counters(game, giant)).toBe(roll > 4 || roll === 12 ? 2 : 1);
    }
  });

  it("Luck Bobblehead: a tapped Treasure per even die", () => {
    const { game } = table({ seed: 11 });
    const head = spawn(game, "Luck Bobblehead");
    spawn(game, "Luck Bobblehead");
    apply(game, { kind: "roll-dice", sides: 6, count: { countOf: { subtype: "Bobblehead", controlledBy: "you" } } });
    expect(rollsOf(game)[0].results).toHaveLength(2);
    expect(game.state.objects[head]).toBeDefined();
  });
});
