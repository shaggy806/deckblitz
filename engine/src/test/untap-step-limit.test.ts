/**
 * "Players can't untap more than one land during their untap steps" (the
 * `untapLimit` static, rule 502.3 — Winter Orb, Static Orb, Winter Moon,
 * Smoke, Mungha Wurm) and "each player chooses artifact, creature, or land
 * during their untap step" (`untapOnlyChosenType` — Storage Matrix). The active
 * player determines which of their permanents untap, with no priority (502.4):
 * a `choose-permanents` a limit at a time, a `choose-modes` a Matrix at a time.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, lands, nextTurn, pickModes, pickPermanents, spawn, table } from "./harness.js";

const tapped = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => game.state.objects[id].tapped === true);
const tapAll = (game: Game, ids: readonly ObjectId[]): void => {
  for (const id of ids) game.state.objects[id].tapped = true;
};
const count = (ids: readonly boolean[], value: boolean): number => ids.filter((t) => t === value).length;

/** Two turns on, to alice's next: bob's first, which is limited too. */
const toAlicesNextTurn = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};

describe("untap step limits", () => {
  it("Winter Orb: she chooses the one land that untaps; the rest stay tapped", () => {
    const { game, a } = table();
    spawn(game, "Winter Orb");
    const forests = lands(game, "Forest", 3);
    const bear = spawn(game, "Grizzly Bears");
    tapAll(game, [...forests, bear]);
    const seen = pickPermanents(a, forests[1]);
    toAlicesNextTurn(game);
    expect(seen.offered).toEqual(forests);
    expect(tapped(game, forests)).toEqual([true, false, true]);
    // Only lands are limited.
    expect(tapped(game, [bear])).toEqual([false]);
  });

  it("a player under the limit, or with a single land to untap, isn't asked", () => {
    const { game, a } = table();
    spawn(game, "Winter Orb");
    const forests = lands(game, "Forest", 3);
    game.state.objects[forests[0]].tapped = true;
    const seen = pickPermanents(a, forests[0]);
    toAlicesNextTurn(game);
    expect(seen.offered).toEqual([]);
    expect(tapped(game, forests)).toEqual([false, false, false]);
  });

  it("Winter Orb tapped as the step begins limits nothing, though it untaps too (its ruling)", () => {
    const { game } = table();
    const orb = spawn(game, "Winter Orb");
    const forests = lands(game, "Forest", 3);
    tapAll(game, [orb, ...forests]);
    toAlicesNextTurn(game);
    expect(tapped(game, [orb, ...forests])).toEqual([false, false, false, false]);
  });

  it("limits every player, whoever controls it", () => {
    const { game, b } = table();
    spawn(game, "Winter Orb");
    const swamps = lands(game, "Swamp", 2, B);
    tapAll(game, swamps);
    const seen = pickPermanents(b, swamps[0]);
    nextTurn(game); // bob's
    expect(seen.offered).toEqual(swamps);
    expect(tapped(game, swamps)).toEqual([false, true]);
  });

  it("Mungha Wurm's limit is its controller's alone", () => {
    const { game, a } = table();
    spawn(game, "Mungha Wurm");
    const forests = lands(game, "Forest", 2);
    const swamps = lands(game, "Swamp", 2, B);
    tapAll(game, [...forests, ...swamps]);
    pickPermanents(a, forests[0]);
    nextTurn(game); // bob's: unlimited
    expect(tapped(game, swamps)).toEqual([false, false]);
    nextTurn(game); // alice's
    expect(tapped(game, forests)).toEqual([false, true]);
  });

  it("Static Orb: any two permanents; it counts creatures and lands alike", () => {
    const { game, a } = table();
    spawn(game, "Static Orb");
    const forest = lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears");
    const rock = spawn(game, "Mind Stone");
    tapAll(game, [...forest, bear, rock]);
    pickPermanents(a, forest[1], bear);
    toAlicesNextTurn(game);
    expect(tapped(game, [...forest, bear, rock])).toEqual([true, false, false, true]);
  });

  it("two Static Orbs don't add together (their ruling)", () => {
    const { game, a } = table();
    spawn(game, "Static Orb");
    spawn(game, "Static Orb");
    const forests = lands(game, "Forest", 4);
    tapAll(game, forests);
    pickPermanents(a, forests[0], forests[1]);
    toAlicesNextTurn(game);
    expect(count(tapped(game, forests), false)).toBe(2);
  });

  it("Winter Moon and Static Orb are cumulative: two permanents, up to one a nonbasic land (its ruling)", () => {
    const { game, a } = table();
    spawn(game, "Winter Moon");
    spawn(game, "Static Orb");
    const wastes = lands(game, "Command Tower", 2);
    const forests = lands(game, "Forest", 2);
    tapAll(game, [...wastes, ...forests]);
    const asked: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      asked.push(eligible);
      return asked.length === 1 ? [wastes[0]] : [wastes[0], forests[1]];
    };
    toAlicesNextTurn(game);
    // Which nonbasic land first, then the two: the other nonbasic is gone by then.
    expect(asked[0]).toEqual(wastes);
    expect([...asked[1]].sort()).toEqual([wastes[0], ...forests].sort());
    expect(tapped(game, [...wastes, ...forests])).toEqual([false, true, true, false]);
  });

  it("the choice is the limit's exact number: fewer is refused (502.3 — only an effect keeps one tapped)", () => {
    const { game, a } = table();
    spawn(game, "Smoke");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    tapAll(game, bears);
    pickPermanents(a);
    expect(() => toAlicesNextTurn(game)).toThrow(/exactly 1/);
  });

  it("an untap step keeps its other reasons: a stun counter still comes off the chosen one", () => {
    const { game, a } = table();
    spawn(game, "Smoke");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    tapAll(game, bears);
    game.state.objects[bears[0]].counters.stun = 1;
    pickPermanents(a, bears[0]);
    toAlicesNextTurn(game);
    expect(game.state.objects[bears[0]].counters.stun).toBeUndefined();
    expect(tapped(game, bears)).toEqual([true, true]);
  });

  it("a token stack counts every token, and one token of it can be the one that untaps", () => {
    const { game, a } = table();
    spawn(game, "Smoke");
    const stack = spawn(game, "Grizzly Bears");
    game.state.objects[stack].stackCount = 3;
    game.state.objects[stack].isToken = true;
    tapAll(game, [stack]);
    pickPermanents(a, stack);
    toAlicesNextTurn(game);
    const bears = game.state.zones.shared.battlefield.map((id) => game.state.objects[id]).filter((o) => o.cardName === "Grizzly Bears");
    const tokens = (t: boolean): number =>
      bears.filter((o) => (o.tapped === true) === t).reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(tokens(false)).toBe(1);
    expect(tokens(true)).toBe(2);
  });

  it("an emblem's limit reaches the opponents it names (Dovin Baan's)", () => {
    const { game, a, b } = table();
    const forests = lands(game, "Forest", 3);
    const swamps = lands(game, "Swamp", 3, B);
    tapAll(game, [...forests, ...swamps]);
    game.debugApplyEffect(
      A,
      {
        kind: "create-emblem",
        text: "Your opponents can't untap more than two permanents during their untap steps.",
        static: {
          affects: { scope: "self" },
          untapLimit: { who: "opponents", count: 2 },
          text: "Your opponents can't untap more than two permanents during their untap steps.",
        },
      },
      [],
      { source: forests[0] },
    );
    pickPermanents(b, swamps[0], swamps[2]);
    const mine = pickPermanents(a);
    toAlicesNextTurn(game);
    expect(mine.offered).toEqual([]);
    expect(tapped(game, swamps)).toEqual([false, true, false]);
    expect(tapped(game, forests)).toEqual([false, false, false]);
  });

  it("a player who has a choice still untaps with no priority: the turn goes on to upkeep", () => {
    const { game, a } = table();
    spawn(game, "Smoke");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    tapAll(game, bears);
    pickPermanents(a, bears[1]);
    toAlicesNextTurn(game);
    expect(game.state.turn.step).toBe("precombat-main");
    expect(tapped(game, bears)).toEqual([true, false]);
  });
});

describe("Storage Matrix", () => {
  const board = (game: Game): { forest: ObjectId; bear: ObjectId; rock: ObjectId; golem: ObjectId } => {
    const forest = lands(game, "Forest", 1)[0];
    const bear = spawn(game, "Grizzly Bears");
    const rock = spawn(game, "Mind Stone");
    const golem = spawn(game, "Ornithopter");
    tapAll(game, [forest, bear, rock, golem]);
    return { forest, bear, rock, golem };
  };

  it("she chooses a type; only that type untaps", () => {
    const { game, a } = table();
    spawn(game, "Storage Matrix");
    const { forest, bear, rock } = board(game);
    pickModes(a, 2); // land
    toAlicesNextTurn(game);
    expect(tapped(game, [forest, bear, rock])).toEqual([false, true, true]);
  });

  it("an artifact creature untaps if either of its types is chosen (the rulings)", () => {
    const { game, a } = table();
    spawn(game, "Storage Matrix");
    const { forest, bear, rock, golem } = board(game);
    pickModes(a, 1); // creature
    toAlicesNextTurn(game);
    expect(tapped(game, [forest, bear, rock, golem])).toEqual([true, false, true, false]);
  });

  it("combines with a limit: creature chosen under Smoke, only one untaps (the rulings)", () => {
    const { game, a } = table();
    spawn(game, "Storage Matrix");
    spawn(game, "Smoke");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    const forest = lands(game, "Forest", 1)[0];
    tapAll(game, [...bears, forest]);
    pickModes(a, 1); // creature
    pickPermanents(a, bears[1]);
    toAlicesNextTurn(game);
    expect(tapped(game, [...bears, forest])).toEqual([true, false, true]);
  });

  it("a tapped Matrix asks nothing, and it doesn't override what keeps a permanent tapped", () => {
    const { game, a } = table();
    const matrix = spawn(game, "Storage Matrix");
    const { forest, bear } = board(game);
    game.state.objects[matrix].tapped = true;
    game.state.objects[bear].skipsNextUntap = true;
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    toAlicesNextTurn(game);
    expect(asked).toBe(0);
    expect(tapped(game, [matrix, forest, bear])).toEqual([false, false, true]);
  });
});
