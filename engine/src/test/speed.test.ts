/**
 * Speed (rules 702.178–702.179, 704.5aa): a player has no speed until a rule
 * or effect sets it; controlling a permanent with start your engines! makes
 * it 1 as a state-based action; an inherent triggered ability — "whenever one
 * or more opponents lose life during your turn, if your speed is less than 4,
 * your speed increases by 1; this ability triggers only once each turn" —
 * raises it, on the stack; and "Max speed — [ability]" gives its object the
 * ability while its controller's speed is 4.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  activate,
  destroy,
  keywords,
  nextTurn,
  pt,
  settle,
  spawn,
  table,
  toStep,
} from "./harness.js";

const speed = (game: Game, player: PlayerId = A): number | undefined => game.state.players[player].speed;
/** Pass priority far enough for a state-based check. */
const check = (game: Game): void => toStep(game, "begin-combat");
/** Each of `player`'s opponents loses `n` life, as one effect of theirs. */
const drain = (game: Game, player: PlayerId = A, n = 1): void =>
  game.debugApplyEffect(player, { kind: "lose-life", amount: n, who: "each-opponent" });
/** Give `player` a speed of `n` the way an effect would. */
const setSpeed = (game: Game, n: number, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "increase-speed", amount: n - (game.state.players[player].speed ?? 0) });

describe("start your engines! (rule 702.179a, 704.5aa)", () => {
  it("a player has no speed until they control a permanent with it, then 1", () => {
    const { game } = table();
    check(game);
    expect(speed(game)).toBeUndefined();
    expect(game.viewFor(A).players[A].speed).toBeNull();
    spawn(game, "Walking Sarcophagus");
    toStep(game, "declare-attackers");
    expect(speed(game)).toBe(1);
    expect(speed(game, B)).toBeUndefined();
    expect(game.viewFor(B).players[A].speed).toBe(1);
    expect(game.state.eventLog.some((e) => e.type === "speed-changed" && e.player === A && e.speed === 1)).toBe(true);
  });

  it("losing the permanent doesn't change speed", () => {
    const { game } = table();
    const sarcophagus = spawn(game, "Walking Sarcophagus");
    check(game);
    destroy(game, sarcophagus);
    nextTurn(game);
    expect(speed(game)).toBe(1);
  });

  it("one that lost its abilities starts nothing", () => {
    const { game } = table();
    const sarcophagus = spawn(game, "Walking Sarcophagus");
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "permanent" }, [
      { kind: "object", object: sarcophagus },
    ]);
    check(game);
    expect(speed(game)).toBeUndefined();
  });

  it("gaining control of one starts its new controller's speed (the rulings)", () => {
    const { game } = table();
    const sarcophagus = spawn(game, "Walking Sarcophagus", B);
    check(game);
    expect(speed(game)).toBeUndefined();
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [
      { kind: "object", object: sarcophagus },
    ]);
    toStep(game, "declare-attackers");
    expect(speed(game)).toBe(1);
  });
});

describe("the inherent speed ability (rule 702.179d)", () => {
  it("an opponent losing life during your turn raises it by 1, on the stack", () => {
    const { game } = table();
    spawn(game, "Walking Sarcophagus");
    check(game);
    drain(game);
    // Put on the stack as a player would next get priority: a sourceless
    // ability of the player's, which can be responded to.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    const [ability] = game.state.zones.shared.stack;
    expect(game.state.objects[ability].cardName).toBe("Speed");
    expect(game.state.objects[ability].controller).toBe(A);
    // Every seat's log can name it.
    const source = game.state.objects[ability].sourceObjectId!;
    expect(game.viewFor(B).publicStints[source]?.[0]?.name).toBe("Speed");
    expect(game.viewFor(B).zones.stack).toContain(ability);
    expect(game.viewFor(B).objects[ability]?.text).toMatch(/^Whenever one or more opponents lose life during your turn/);
    expect(speed(game)).toBe(1);
    settle(game);
    expect(speed(game)).toBe(2);
  });

  it("triggers only once each turn, however many times or opponents lose life", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Walking Sarcophagus");
    check(game);
    drain(game); // three opponents at once
    settle(game);
    drain(game);
    settle(game);
    expect(speed(game)).toBe(2);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    // Next time it's alice's turn, once more.
    for (const p of [B, C, D, A]) {
      nextTurn(game);
      expect(game.state.turn.number).toBeGreaterThan(1);
      if (p !== A) continue;
      drain(game);
      settle(game);
    }
    expect(speed(game)).toBe(3);
  });

  it("not during an opponent's turn", () => {
    const { game } = table();
    spawn(game, "Walking Sarcophagus");
    check(game);
    nextTurn(game); // bob's turn
    drain(game);
    settle(game);
    expect(speed(game)).toBe(1);
  });

  it("not for a player with no speed", () => {
    const { game } = table();
    drain(game);
    settle(game);
    expect(speed(game)).toBeUndefined();
  });

  it("stops at max speed: at 4 it doesn't trigger", () => {
    const { game } = table();
    spawn(game, "Walking Sarcophagus");
    check(game);
    setSpeed(game, 4);
    expect(speed(game)).toBe(4);
    drain(game);
    expect(game.state.pendingTriggers).toHaveLength(0);
    settle(game);
    expect(speed(game)).toBe(4);
  });

  it("the intervening if is asked again as it resolves (rule 603.4)", () => {
    const { game } = table();
    spawn(game, "Walking Sarcophagus");
    check(game);
    setSpeed(game, 3);
    drain(game);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    // Speed reaches 4 another way while the ability waits.
    setSpeed(game, 4);
    settle(game);
    expect(speed(game)).toBe(4);
  });

  it("with no speed, an increase sets it to that much (rule 702.179c)", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "increase-speed", amount: 2 });
    expect(speed(game)).toBe(2);
  });
});

describe("max speed (rule 702.178a)", () => {
  it("gives its object the ability only while its controller's speed is 4", () => {
    const { game } = table();
    const sarcophagus = spawn(game, "Walking Sarcophagus");
    const oilgorger = spawn(game, "Streaking Oilgorger");
    check(game);
    expect(pt(game, sarcophagus)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, oilgorger).has("lifelink")).toBe(false);
    setSpeed(game, 3);
    expect(pt(game, sarcophagus)).toEqual({ power: 2, toughness: 1 });
    setSpeed(game, 4);
    expect(pt(game, sarcophagus)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, oilgorger).has("lifelink")).toBe(true);
  });

  it("reads its controller's speed, not its owner's", () => {
    const { game } = table();
    const sarcophagus = spawn(game, "Walking Sarcophagus", B);
    setSpeed(game, 4);
    check(game);
    expect(pt(game, sarcophagus)).toEqual({ power: 2, toughness: 1 });
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [
      { kind: "object", object: sarcophagus },
    ]);
    toStep(game, "declare-attackers");
    expect(pt(game, sarcophagus)).toEqual({ power: 3, toughness: 3 });
  });

  it("a granted mana ability makes mana at max speed (Muraganda Raceway)", () => {
    const { game } = table();
    const raceway = spawn(game, "Muraganda Raceway");
    check(game);
    const offers = (): number =>
      game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === raceway).length;
    const before = offers();
    setSpeed(game, 4);
    expect(offers()).toBe(before + 1);
    activate(game, raceway, 1);
    expect(game.state.players[A].manaPool.length).toBe(2);
  });
});
