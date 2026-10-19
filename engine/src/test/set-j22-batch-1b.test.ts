/**
 * Jumpstart 2022 (J22), set batch 1, group b (2026-10-19).
 * Written from the Oracle text on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Spectral Hunt-Caller", () => {
  it("gives only your creatures +1/+1 and trample until end of turn", () => {
    const { game } = table();
    const caller = spawn(game, "Spectral Hunt-Caller");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 6);
    activate(game, caller);
    expect(pt(game, caller)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, theirs).has("trample")).toBe(false);
    toStep(game, "upkeep", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Conductor of Cacophony", () => {
  it("enters with two +1/+1 counters, and spends one to deal 1 to each other creature and each player", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Conductor of Cacophony");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(counters(game, card)).toBe(2);
    expect(pt(game, card)).toEqual({ power: 4, toughness: 3 });

    const bears = spawn(game, "Grizzly Bears", B);
    const memnite = spawn(game, "Memnite");
    activate(game, card);
    expect(counters(game, card)).toBe(1);
    expect(game.state.objects[card].damageMarked).toBe(0);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(zone(game, memnite)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Skullslither Worm", () => {
  it("makes each opponent discard, and gets two +1/+1 counters for each who can't", () => {
    const { game } = table({ players: 4 });
    // Every opponent's hand emptied, then Bob alone given one card back.
    game.debugApplyEffect(A, { kind: "discard-hand", who: "each-opponent" });
    settle(game);
    const kept = toHand(game, "Grizzly Bears", B);
    expect(hand(game, B)).toEqual([kept]);
    expect(hand(game, C)).toEqual([]);
    const worm = enter(game, "Skullslither Worm");
    expect(graveyard(game, B)).toContain(kept);
    expect(hand(game, B)).toEqual([]);
    // Carol and Dave couldn't discard: two counters for each.
    expect(counters(game, worm)).toBe(4);
    expect(pt(game, worm)).toEqual({ power: 7, toughness: 7 });
  });

  it("gets no counters when every opponent discards", () => {
    const { game } = table();
    expect(hand(game, B).length).toBeGreaterThan(0);
    const before = hand(game, B).length;
    const worm = enter(game, "Skullslither Worm");
    expect(hand(game, B).length).toBe(before - 1);
    expect(counters(game, worm)).toBe(0);
  });
});

describe("Ingenious Leonin", () => {
  it("puts a +1/+1 counter on another attacking creature, and first strike only if it's a Cat", () => {
    const { game, a } = table();
    const leonin = spawn(game, "Ingenious Leonin");
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 8);
    a.declareAttackersFn = () => [
      { attacker: lions, defender: B },
      { attacker: bears, defender: B },
      { attacker: leonin, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    activate(game, leonin, 0, { targets: [ref(lions)] });
    expect(counters(game, lions)).toBe(1);
    expect(keywords(game, lions).has("first-strike")).toBe(true);
    activate(game, leonin, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    // "Another": never itself, though it's an attacking Cat.
    expect(() => activate(game, leonin, 0, { targets: [ref(leonin)] })).toThrow(/refused/);
  });

  it("can't target a creature that isn't attacking", () => {
    const { game } = table();
    const leonin = spawn(game, "Ingenious Leonin");
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Plains", 4);
    expect(() => activate(game, leonin, 0, { targets: [ref(lions)] })).toThrow(/refused/);
  });
});
