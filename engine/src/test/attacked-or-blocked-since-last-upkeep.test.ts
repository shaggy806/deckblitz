/**
 * "If it attacked or blocked since your last upkeep" (Shape of the Wiitigo):
 * `turn-history`'s `"attackers"` / `"blockers"` views over the window
 * `"since-your-last-upkeep"` (read during your upkeep, the one before it on —
 * Echo's reading, rule 702.30a), about the enchanted creature alone
 * (`attachedOnly`).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { inJournalWindow } from "../journal.js";
import { A, B, attack, cast, counters, lands, nextTurn, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

const enchant = (game: Game): ObjectId => {
  const bear = spawn(game, "Grizzly Bears");
  lands(game, "Forest", 6);
  cast(game, toHand(game, "Shape of the Wiitigo"), { targets: [ref(bear)] });
  settle(game);
  return bear;
};

/** On to A's next upkeep, its trigger resolved. */
const toAUpkeep = (game: Game): void => {
  nextTurn(game);
  nextTurn(game, "draw");
};

describe("Shape of the Wiitigo", () => {
  it("enters putting six +1/+1 counters on the enchanted creature", () => {
    const { game } = table();
    const bear = enchant(game);
    expect(counters(game, bear, "+1/+1")).toBe(6);
  });

  it("neither attacked nor blocked: a counter comes off at your upkeep", () => {
    const { game } = table();
    const bear = enchant(game);
    toAUpkeep(game);
    expect(counters(game, bear, "+1/+1")).toBe(5);
  });

  it("attacked during your last turn: a counter goes on", () => {
    const { game, a } = table();
    const bear = enchant(game);
    attack(game, a, [bear]);
    toAUpkeep(game);
    expect(counters(game, bear, "+1/+1")).toBe(7);
  });

  it("blocked during an opponent's turn: a counter goes on", () => {
    const { game, a, b } = table();
    const bear = enchant(game);
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    a.declareBlockersFn = () => [{ blocker: bear, attacker: giant }];
    attack(game, b, [giant], A);
    toStep(game, "end", B);
    nextTurn(game, "draw");
    expect(counters(game, bear, "+1/+1")).toBe(7);
  });

  it("an attack before your last upkeep doesn't count", () => {
    const { game, a } = table();
    const bear = enchant(game);
    attack(game, a, [bear]);
    // No attack on the turns after (the scripted attack would repeat).
    a.declareAttackersFn = () => [];
    toAUpkeep(game);
    expect(counters(game, bear, "+1/+1")).toBe(7);
    toAUpkeep(game);
    expect(counters(game, bear, "+1/+1")).toBe(6);
  });

  it("another creature's attack isn't the enchanted creature's", () => {
    const { game, a } = table();
    const bear = enchant(game);
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [other]);
    toAUpkeep(game);
    expect(counters(game, bear, "+1/+1")).toBe(5);
  });

  it("the window: your last turn and after, everything with no last turn yet", () => {
    const { game } = table();
    expect(inJournalWindow(game.state, "since-your-last-upkeep", 1, A, A)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // Turn 3, A's: the last upkeep was turn 1's.
    expect(inJournalWindow(game.state, "since-your-last-upkeep", 1, A, A)).toBe(true);
    expect(inJournalWindow(game.state, "since-your-last-upkeep", 2, A, A)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(inJournalWindow(game.state, "since-your-last-upkeep", 2, A, A)).toBe(false);
    expect(inJournalWindow(game.state, "since-your-last-upkeep", 3, A, A)).toBe(true);
  });
});
