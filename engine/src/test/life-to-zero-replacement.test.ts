/**
 * "If your life total would be reduced to 0 or less, instead …" — a
 * `would-lose-life` replacement with `toZeroOrLess` (rule 614.1a): Enduring
 * Angel. Every loss that would leave the life total at 0 or less is replaced
 * whole (rule 614.6) — damage's, an effect's, a set total's — once the other
 * replacements have changed the amount; the life total becoming 3 is a gain or
 * a loss of the difference (rule 119.5). A copy that can't transform (a token)
 * loses the game (the card's rulings), through `transform`'s `otherwise`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { A, B, attack, cast, keywords, lands, life, nextTurn, pt, ref, spawn, table, toHand } from "./harness.js";

const isTransformed = (game: ReturnType<typeof table>["game"], id: ObjectId): boolean => (game.state.objects[id].face ?? 0) === 1;

describe("Enduring Angel", () => {
  it("gives you hexproof", () => {
    const { game } = table();
    spawn(game, "Enduring Angel", A);
    nextTurn(game); // Bob's
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] })).toThrow(/illegal target/);
  });

  it("damage that would leave you at 0 transforms it and sets your life total to 3", () => {
    const { game, b } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 2;
    nextTurn(game); // Bob's
    attack(game, b, [spawn(game, "Hill Giant", B)], A);
    expect(life(game, A)).toBe(3);
    expect(game.state.result.over).toBe(false);
    expect(isTransformed(game, angel)).toBe(true);
    // Angelic Enforcer: no double strike, and its life-total P/T.
    expect(keywords(game, angel).has("double-strike")).toBe(false);
    expect(pt(game, angel)).toEqual({ power: 3, toughness: 3 });
  });

  it("a loss that leaves you above 0 is not replaced", () => {
    const { game, b } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 4;
    nextTurn(game);
    attack(game, b, [spawn(game, "Hill Giant", B)], A);
    expect(life(game, A)).toBe(1);
    expect(isTransformed(game, angel)).toBe(false);
  });

  it("from 10, a loss of 10 becomes a loss of 7 (rule 119.5), and once transformed the next one kills", () => {
    const { game } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 10;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 10, who: "each-opponent" }, []);
    expect(life(game, A)).toBe(3);
    expect(isTransformed(game, angel)).toBe(true);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 3, who: "each-opponent" }, []);
    expect(life(game, A)).toBe(0);
  });

  it("reads the loss after a doubling (Bloodletter of Aclazotz) brings it to 0, which doesn't double the set total's loss (rule 614.5)", () => {
    const { game, b } = table();
    spawn(game, "Bloodletter of Aclazotz", B);
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 5;
    nextTurn(game); // Bob's: the Giant's 3 becomes a loss of 6
    attack(game, b, [spawn(game, "Hill Giant", B)], A);
    expect(life(game, A)).toBe(3);
    expect(isTransformed(game, angel)).toBe(true);
  });

  it("a life total set to 0 is a loss it replaces too (rule 119.5)", () => {
    const { game } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 2;
    game.debugApplyEffect(A, { kind: "set-life-total", who: "you", amount: 0 }, []);
    expect(life(game, A)).toBe(3);
    expect(isTransformed(game, angel)).toBe(true);
  });

  it("from 1, life becomes 3: a gain of 2", () => {
    const { game } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 1;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5, who: "each-opponent" }, []);
    expect(life(game, A)).toBe(3);
    expect(isTransformed(game, angel)).toBe(true);
  });

  it("combat damage to you is replaced, and a token copy that can't transform loses you the game", () => {
    const { game, b } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(angel)]);
    // The real one goes: only the token copy is left to replace the loss.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(angel)]);
    game.state.players[A].life = 2;
    nextTurn(game); // Bob's
    const giant = spawn(game, "Hill Giant", B);
    attack(game, b, [giant], A);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("with the card and a token copy, the card's replacement applies and you live", () => {
    const { game } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(angel)]);
    game.state.players[A].life = 2;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5, who: "each-opponent" }, []);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(life(game, A)).toBe(3);
    expect(isTransformed(game, angel)).toBe(true);
  });
});

describe("Angelic Enforcer", () => {
  it("doubles your life total when it attacks, and its power follows it", () => {
    const { game, a } = table();
    const angel = spawn(game, "Enduring Angel", A);
    game.state.players[A].life = 1;
    game.debugApplyEffect(B, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    expect(isTransformed(game, angel)).toBe(true);
    attack(game, a, [angel]);
    // 3 doubled to 6 as it attacks, then it deals 6 to Bob.
    expect(life(game, A)).toBe(6);
    expect(life(game, B)).toBe(14);
  });
});
