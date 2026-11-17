/**
 * "The greatest amount of damage dealt by a source to a permanent or player
 * this turn" (Impact Resonance): the `damageDealtThisTurn` amount's
 * `oneSource` and `oneRecipient`, grouping the journal's damage entries by
 * source and by recipient — each object in each stint its own (rule 400.7) —
 * and taking the largest group. Read as the spell is cast, when the division
 * is announced (rule 601.2d).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { damageDealtThisTurn } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, lands, ref, spawn, table, toHand, toStep } from "./harness.js";

const divideOffer = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card)?.divide;

const everyone = [A, B];

describe("Impact Resonance", () => {
  it("two sources at one player: the larger, not the sum", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const resonance = toHand(game, "Impact Resonance");
    expect(divideOffer(game, resonance)).toEqual({ total: 3, slot: 0 });
    cast(game, resonance, { targets: [ref(bear), ref(giant)], division: [2, 1] });
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(1);
    // The same entries, grouped by recipient alone: 5 to Bob.
    expect(damageDealtThisTurn(game.state, everyone, undefined, undefined, { oneRecipient: true })).toBe(5);
  });

  it("one source at many things: what it dealt to one of them (Earthquake's ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Earthquake"), { x: 2 });
    const resonance = toHand(game, "Impact Resonance");
    expect(divideOffer(game, resonance)).toEqual({ total: 2, slot: 0 });
    // By that one source to anything: 2 to each of four things.
    expect(damageDealtThisTurn(game.state, everyone, undefined, undefined, { oneSource: true })).toBe(8);
  });

  it("one source at one player twice: all of it (double strike)", () => {
    const { game, a } = table();
    const blade = spawn(game, "Boros Swiftblade", A);
    attack(game, a, [blade]);
    lands(game, "Mountain", 2);
    const resonance = toHand(game, "Impact Resonance");
    expect(divideOffer(game, resonance)).toEqual({ total: 2, slot: 0 });
  });

  it("an opponent's source counts, and no damage at all is 0", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const resonance = toHand(game, "Impact Resonance");
    expect(divideOffer(game, resonance)?.total ?? 0).toBe(0);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    // Bob passes with nothing on the stack: Alice has priority in his main phase.
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(divideOffer(game, resonance)).toEqual({ total: 3, slot: 0 });
  });
});
