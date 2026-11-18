/**
 * "Each opponent who discarded a card that shares a card type with the card
 * you discarded" (Creeping Dread): the `this-way` condition's filter, asked
 * of the card each opponent discarded in the same simultaneous discard
 * (rule 101.4), against `{ typesOf: { thisWay: "discarded", who: "you" } }`
 * — card types only (rule 205.2a), bound as the condition is asked.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, graveyard, life, table, toHand, toStep } from "./harness.js";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/** The seat discards this card when asked. */
function discards(seat: ScriptedController, id: ObjectId): void {
  seat.chooseDiscardsFn = () => [id];
}

/** Each player's opening hand discarded, so the test's own cards are what they hold. */
function emptyHands(game: Game, players: readonly PlayerId[]): void {
  for (const p of players) game.debugApplyEffect(p, { kind: "discard-hand", who: "you" });
}

describe("Creeping Dread", () => {
  it("each opponent whose discard shares a card type with yours loses 3 life; one that doesn't, none", () => {
    const { game, a, b, c } = table({ players: 3 });
    enter(game, "Creeping Dread");
    emptyHands(game, [A, B, C]);
    const mine = toHand(game, "Grizzly Bears", A);
    toHand(game, "Lightning Bolt", A);
    const bobs = toHand(game, "Llanowar Elves", B);
    toHand(game, "Swamp", B);
    const carols = toHand(game, "Lightning Bolt", C);
    toHand(game, "Grizzly Bears", C);
    discards(a, mine);
    discards(b, bobs);
    discards(c, carols);
    toStep(game, "draw", A);
    expect(graveyard(game, A)).toContain(mine);
    expect(graveyard(game, B)).toContain(bobs);
    expect(graveyard(game, C)).toContain(carols);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("an artifact creature against an artifact still costs 3 life once (the ruling)", () => {
    const { game, a, b } = table({ players: 2 });
    enter(game, "Creeping Dread");
    emptyHands(game, [A, B]);
    const mine = toHand(game, "Ornithopter", A);
    const bobs = toHand(game, "Sol Ring", B);
    discards(a, mine);
    discards(b, bobs);
    toStep(game, "draw", A);
    expect(graveyard(game, B)).toContain(bobs);
    expect(life(game, B)).toBe(17);
  });

  it("a creature against a land shares no card type, whatever their supertypes and subtypes", () => {
    const { game, a, b } = table({ players: 2 });
    enter(game, "Creeping Dread");
    emptyHands(game, [A, B]);
    const mine = toHand(game, "Llanowar Elves", A);
    const bobs = toHand(game, "Swamp", B);
    discards(a, mine);
    discards(b, bobs);
    toStep(game, "draw", A);
    expect(graveyard(game, B)).toContain(bobs);
    expect(life(game, B)).toBe(20);
  });

  it("you with no card to discard: no opponent loses life (the ruling)", () => {
    const { game, b } = table({ players: 2 });
    enter(game, "Creeping Dread");
    emptyHands(game, [A, B]);
    const bobs = toHand(game, "Grizzly Bears", B);
    discards(b, bobs);
    // Alice draws only after her upkeep, so her hand is empty as it resolves.
    toStep(game, "draw", A);
    expect(graveyard(game, B)).toContain(bobs);
    expect(life(game, B)).toBe(20);
  });
});
