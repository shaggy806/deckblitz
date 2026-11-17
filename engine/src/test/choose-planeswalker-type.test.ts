/**
 * "Choose a planeswalker type" as an ability resolves (rule 205.3j's list):
 * the `choose-creature-type` effect over `PLANESWALKER_TYPES`, the chooser's
 * own planeswalkers' types suggested first — Leori, Sparktouched Hunter, whose
 * choice sets up a delayed "whenever" for the rest of the turn (rule 603.7)
 * copying every ability of a planeswalker of that type its controller
 * activates (rule 707.10), not just the next.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { PLANESWALKER_TYPES } from "../subtypes.js";
import { A, B, attack, counters, hand, life, loyalty, ref, spawn, table, toStep } from "./harness.js";

/** Alice's table, her planeswalker-type answer `type` (and the menu offered). */
function naming(type: string) {
  const t = table();
  const offered: { options: readonly string[]; suggested: readonly string[]; asked: number } = {
    options: [],
    suggested: [],
    asked: 0,
  };
  t.a.chooseCreatureTypeFn = (view, _source, options) => {
    const legal = view
      .legalActions()
      .find((x): x is Extract<LegalAction, { kind: "choose-creature-type" }> => x.kind === "choose-creature-type");
    offered.options = options;
    offered.suggested = legal?.suggested ?? [];
    offered.asked += 1;
    return type;
  };
  return { ...t, offered };
}

describe("Leori, Sparktouched Hunter", () => {
  it("names a planeswalker type as its combat damage trigger resolves, from every type, its controller's own first", () => {
    const { game, a, offered } = naming("Ajani");
    const leori = spawn(game, "Leori, Sparktouched Hunter");
    spawn(game, "Ajani Goldmane");
    attack(game, a, [leori]);
    expect(life(game, B)).toBe(17);
    expect(offered.asked).toBe(1);
    expect(offered.options).toEqual(PLANESWALKER_TYPES);
    expect(offered.suggested[0]).toBe("Ajani");
  });

  it("copies every ability of a planeswalker of that type activated this turn, and no other planeswalker's", () => {
    const { game, a } = naming("Ajani");
    const leori = spawn(game, "Leori, Sparktouched Hunter");
    const ajani = spawn(game, "Ajani Goldmane");
    const second = spawn(game, "Ajani, Caller of the Pride");
    const jace = spawn(game, "Jace Beleren");
    attack(game, a, [leori]);
    toStep(game, "postcombat-main");
    // "+1: You gain 2 life", and its copy.
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(24);
    // A copy changes no loyalty (the ruling).
    expect(counters(game, ajani, "loyalty")).toBe(5);
    // A Jace isn't an Ajani: "+2: Each player draws a card" isn't copied.
    const cards = hand(game, A).length;
    loyalty(game, jace, 2);
    expect(hand(game, A).length).toBe(cards + 1);
    // Every one this turn, not just the next: "+1: Put a +1/+1 counter on up
    // to one target creature", and its copy, on the same target.
    loyalty(game, second, 1, { targets: [ref(leori)] });
    expect(counters(game, leori)).toBe(2);
  });

  it("copies nothing on a later turn, nor when it dealt no combat damage", () => {
    const { game, a, offered } = naming("Ajani");
    const leori = spawn(game, "Leori, Sparktouched Hunter");
    const ajani = spawn(game, "Ajani Goldmane");
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(22);
    expect(offered.asked).toBe(0);
    attack(game, a, [leori]);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(24);
  });
});
