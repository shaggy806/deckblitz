/**
 * Empower Jace N (rule 701.71a, Reality Fracture): with no Jace planeswalker
 * token, create a blue Jace planeswalker token with 0 loyalty, "[−1]: Surveil
 * 1" and "[−3]: Draw a card"; then put N loyalty counters on a Jace
 * planeswalker token you control — chosen when there are several, never a
 * nontoken Jace (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, counters, hand, pickPermanents, settle, spawn, table, types } from "./harness.js";

const jaceTokens = (game: Game, player = A): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Jace Token" && game.state.objects[id].controller === player,
  );
const empower = (game: Game, amount: number, player = A): void => {
  game.debugApplyEffect(player, { kind: "empower-jace", amount }, []);
  settle(game);
};

describe("Empower Jace", () => {
  it("creates a Jace planeswalker token with that much loyalty when you control none", () => {
    const { game } = table();
    empower(game, 2);
    const [jace] = jaceTokens(game);
    expect(jace).toBeDefined();
    expect(types(game, jace)).toEqual(["planeswalker"]);
    expect(counters(game, jace, "loyalty")).toBe(2);
  });

  it("puts the counters on the Jace token you have instead of making another", () => {
    const { game } = table();
    empower(game, 2);
    empower(game, 1);
    expect(jaceTokens(game)).toHaveLength(1);
    expect(counters(game, jaceTokens(game)[0], "loyalty")).toBe(3);
  });

  it("never empowers a nontoken Jace: it makes a token beside it", () => {
    const { game } = table();
    const beleren = spawn(game, "Jace Beleren");
    const before = counters(game, beleren, "loyalty");
    empower(game, 1);
    expect(counters(game, beleren, "loyalty")).toBe(before);
    expect(jaceTokens(game)).toHaveLength(1);
  });

  it("an opponent's Jace token isn't yours to empower", () => {
    const { game } = table();
    empower(game, 2, B);
    empower(game, 1);
    expect(jaceTokens(game, B)).toHaveLength(1);
    expect(counters(game, jaceTokens(game, B)[0], "loyalty")).toBe(2);
    expect(counters(game, jaceTokens(game)[0], "loyalty")).toBe(1);
  });

  it("with two Jace tokens, you choose which", () => {
    const { game, a } = table();
    empower(game, 1);
    // A second Jace token with a loyalty counter (as a copy of the first
    // would be) — `spawn` makes a card, so it's marked a token.
    const [first] = jaceTokens(game);
    const second = spawn(game, "Jace Token");
    game.state.objects[second].isToken = true;
    game.state.objects[second].counters = { ...game.state.objects[second].counters, loyalty: 1 };
    const seen = pickPermanents(a, second);
    empower(game, 3);
    expect([...seen.offered].sort()).toEqual([first, second].sort());
    expect(counters(game, second, "loyalty")).toBe(4);
    expect(counters(game, first, "loyalty")).toBe(1);
  });

  it("the token's −3 draws a card", () => {
    const { game } = table();
    empower(game, 3);
    const [jace] = jaceTokens(game);
    const before = hand(game).length;
    activate(game, jace, 1);
    expect(hand(game).length).toBe(before + 1);
    // At 0 loyalty it died — and a token that leaves ceases to exist.
    expect(game.state.objects[jace]?.zone ?? "gone").not.toBe("battlefield");
  });
});
