/**
 * "Whenever a permanent entering causes a triggered ability to trigger,
 * counter that ability unless its controller pays {2}." — Strict Proctor: the
 * `entry-triggers-ability` trigger event, any player's triggered ability whose
 * trigger event was a permanent entering (its own source's or another's), as
 * that ability goes on the stack, so this goes on above it and resolves first
 * (rule 603.3b, the ruling). Never a dies trigger, nor an "as this enters"
 * replacement (rule 614.1c, the ruling). Written from the Oracle text and its
 * rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import { A, B, cast, destroy, enter, hand, lands, life, pickModes, pt, spawn, table, toHand } from "./harness.js";

/** The seat pays every "unless" it's offered (`pay`) or declines it (no
 * mode), and counts the offers. Only a player who can pay is asked. */
function answerUnless(seat: ScriptedController, pay: boolean): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = (_view, minModes, _maxModes, texts) => {
    const payAt = texts.findIndex((t) => t.startsWith("Pay {2}"));
    if (payAt < 0) return Array.from({ length: minModes }, (_unused, i) => i);
    seen.asked += 1;
    return pay ? [payAt] : [];
  };
  return seen;
}

const triggeredFrom = (game: Game, since: number): string[] =>
  game.state.eventLog.flatMap((e) =>
    e.seq >= since && e.type === "ability-triggered" ? [game.state.objects[e.source]?.cardName ?? "?"] : [],
  );
const seqNow = (game: Game): number => (game.state.eventLog.at(-1)?.seq ?? 0) + 1;

describe("Strict Proctor", () => {
  it("counters a creature's own enters trigger unless its controller pays {2}: declined", () => {
    const { game, b } = table();
    spawn(game, "Strict Proctor", A);
    lands(game, "Plains", 2, B);
    const seen = answerUnless(b, false);
    const cards = hand(game, B).length;
    enter(game, "Elvish Visionary", B);
    expect(seen.asked).toBe(1);
    expect(hand(game, B).length).toBe(cards);
  });

  it("paid, the ability resolves", () => {
    const { game, b } = table();
    spawn(game, "Strict Proctor", A);
    const plains = lands(game, "Plains", 2, B);
    const seen = answerUnless(b, true);
    const cards = hand(game, B).length;
    enter(game, "Elvish Visionary", B);
    expect(seen.asked).toBe(1);
    expect(hand(game, B).length).toBe(cards + 1);
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("goes on the stack after the ability it watches, so resolves first", () => {
    const { game, b } = table();
    spawn(game, "Strict Proctor", A);
    answerUnless(b, false);
    const since = seqNow(game);
    enter(game, "Elvish Visionary", B);
    expect(triggeredFrom(game, since)).toEqual(["Elvish Visionary", "Strict Proctor"]);
  });

  it("an ability watching another permanent enter counts, its controller's own included (Soul Warden)", () => {
    const { game, a } = table();
    spawn(game, "Strict Proctor", A);
    spawn(game, "Soul Warden", A);
    lands(game, "Plains", 2, A);
    const seen = answerUnless(a, false);
    enter(game, "Grizzly Bears", B);
    expect(seen.asked).toBe(1);
    expect(life(game, A)).toBe(20);
  });

  it("with no way to pay, the ability is countered unasked", () => {
    const { game, a } = table();
    spawn(game, "Strict Proctor", A);
    spawn(game, "Soul Warden", A);
    const seen = answerUnless(a, true);
    const since = seqNow(game);
    enter(game, "Grizzly Bears", B);
    expect(seen.asked).toBe(0);
    expect(triggeredFrom(game, since)).toEqual(["Soul Warden", "Strict Proctor"]);
    expect(life(game, A)).toBe(20);
  });

  it("a land entering counts too (landfall)", () => {
    const { game, a } = table();
    spawn(game, "Strict Proctor", A);
    const lynx = spawn(game, "Steppe Lynx", A);
    lands(game, "Plains", 2, A);
    const seen = answerUnless(a, false);
    enter(game, "Plains", A);
    expect(seen.asked).toBe(1);
    expect(pt(game, lynx)).toEqual({ power: 0, toughness: 1 });
  });

  it("a dies trigger doesn't count", () => {
    const { game, a } = table();
    spawn(game, "Strict Proctor", A);
    const traveler = spawn(game, "Doomed Traveler", A);
    const seen = answerUnless(a, false);
    destroy(game, traveler);
    expect(seen.asked).toBe(0);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Spirit Token")).toBe(true);
  });

  it("an \"as this enters\" choice is no triggered ability (Clone)", () => {
    const { game, a } = table();
    spawn(game, "Strict Proctor", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    a.chooseCopyFn = () => bears;
    const since = seqNow(game);
    cast(game, toHand(game, "Clone"));
    expect(triggeredFrom(game, since)).toEqual([]);
  });

  it("a doubled enters trigger is two abilities, each countered on its own (Panharmonicon)", () => {
    const { game, b } = table();
    spawn(game, "Strict Proctor", A);
    spawn(game, "Panharmonicon", B);
    lands(game, "Plains", 2, B);
    const seen = answerUnless(b, false);
    const cards = hand(game, B).length;
    enter(game, "Elvish Visionary", B);
    expect(seen.asked).toBe(2);
    expect(hand(game, B).length).toBe(cards);
  });
});

describe("a doubled trigger is two abilities to whatever watches them go on the stack", () => {
  it("Aboleth Spawn copies each of the two (Panharmonicon)", () => {
    const { game, b } = table();
    spawn(game, "Panharmonicon", A);
    spawn(game, "Aboleth Spawn", B);
    pickModes(b, 0);
    const alice = hand(game, A).length;
    const bob = hand(game, B).length;
    enter(game, "Elvish Visionary", A);
    expect(hand(game, A).length).toBe(alice + 2);
    expect(hand(game, B).length).toBe(bob + 2);
  });

  it("with nothing watching, the doubled trigger still does its work twice", () => {
    const { game } = table();
    spawn(game, "Panharmonicon", A);
    const alice = hand(game, A).length;
    enter(game, "Elvish Visionary", A);
    expect(hand(game, A).length).toBe(alice + 2);
  });
});
