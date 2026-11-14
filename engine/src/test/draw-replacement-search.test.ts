/**
 * "If you would draw a card, you may instead search your library for a card,
 * put that card into your hand, then shuffle" behind a quest-counter
 * condition (Archmage Ascension): a `would-draw` `may` replacement whose
 * `effect` is a search, asked of the drawing player at each draw (rule
 * 616.1); the card found isn't drawn (rule 614.11). Its quest counter is an
 * intervening "if" on the end step trigger (rule 603.4).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, counters, hand, setTurnTotal, settle, spawn, table, toLibrary, toStep, turnTotal } from "./harness.js";

const quests = (game: Game, id: ObjectId) => counters(game, id, "quest");

/** An Ascension with six quest counters on it. */
function charged(game: Game): ObjectId {
  const ascension = spawn(game, "Archmage Ascension");
  game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "quest", amount: 6 }, [], { source: ascension });
  settle(game);
  return ascension;
}

/** Answers the "draw or search" question with `replace`, recording it. */
function replaceDraws(seat: ScriptedController, replace: boolean): string[][] {
  const asked: string[][] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    const ascension = texts.findIndex((t) => t.startsWith("Archmage Ascension"));
    return [replace ? ascension : texts.indexOf("Draw a card")];
  };
  return asked;
}

describe("Archmage Ascension", () => {
  it("with six quest counters, a draw may become a search: the card found goes to hand, not drawn", () => {
    const { game, a } = table();
    charged(game);
    const wanted = toLibrary(game, "Shock");
    toLibrary(game, "Forest");
    const asked = replaceDraws(a, true);
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(wanted) ? [wanted] : eligible.slice(0, 1));
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked[0]).toContain("Draw a card");
    expect(hand(game)).toContain(wanted);
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore);
  });

  it("declined, the card is drawn", () => {
    const { game, a } = table();
    charged(game);
    const top = toLibrary(game, "Forest");
    replaceDraws(a, false);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game)).toContain(top);
  });

  it("with five quest counters nothing is asked", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Archmage Ascension");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "quest", amount: 5 }, [], { source: ascension });
    const top = toLibrary(game, "Forest");
    const asked = replaceDraws(a, true);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toEqual([]);
    expect(hand(game)).toContain(top);
  });

  it("an opponent's draw isn't replaced", () => {
    const { game, b } = table();
    charged(game);
    const top = toLibrary(game, "Forest", B);
    const asked = replaceDraws(b, true);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(asked).toEqual([]);
    expect(hand(game, B)).toContain(top);
  });

  it("at each end step, a quest counter only if you drew two or more cards this turn", () => {
    const { game, a } = table();
    const ascension = spawn(game, "Archmage Ascension");
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [0];
    };
    for (let i = 0; i < 3; i++) toLibrary(game, "Forest");
    // Just one card drawn this turn.
    setTurnTotal(game.state, A, "card-drawn", 0);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    toStep(game, "end");
    settle(game);
    expect(asked).toEqual([]);
    expect(quests(game, ascension)).toBe(0);
    // The opponent's turn: alice draws two, and it's each end step.
    toStep(game, "precombat-main", B);
    setTurnTotal(game.state, A, "card-drawn", 0);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    toStep(game, "end", B);
    settle(game);
    expect(asked).toHaveLength(1);
    expect(quests(game, ascension)).toBe(1);
  });
});
