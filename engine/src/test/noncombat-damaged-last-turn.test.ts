/**
 * The journal word `"noncombat-damaged"` (a player dealt damage other than
 * combat damage, rule 120.2), read over last turn: Command the Stage's "at
 * the beginning of each upkeep, if an opponent was dealt noncombat damage
 * last turn, return this card from your graveyard to your hand".
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, cast, counters, graveyard, hand, lands, nextTurn, ref, spawn, table, toGraveyard, toHand, tokensNamed } from "./harness.js";

const NAME = "Command the Stage";

describe("Command the Stage", () => {
  it("makes a Cadet and puts a counter on each other Wizard token, not the new one", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    game.debugApplyEffect(A, { kind: "create-token", token: "Cadet", count: 1 });
    const old = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Cadet")!;
    // A Wizard that isn't a token gets none.
    const wizard = spawn(game, "Cadet");
    cast(game, toHand(game, NAME));
    expect(counters(game, wizard)).toBe(0);
    expect(tokensNamed(game, "Cadet", A)).toBe(2);
    expect(counters(game, old)).toBe(1);
    const fresh = game.state.zones.shared.battlefield.find((id) => id !== old && game.state.objects[id].cardName === "Cadet");
    expect(fresh).toBeDefined();
    expect(counters(game, fresh!)).toBe(0);
  });

  it("returns to hand at the next upkeep after an opponent was dealt noncombat damage", () => {
    const { game } = table();
    const card = toGraveyard(game, NAME);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)]);
    nextTurn(game, "draw");
    expect(hand(game, A)).toContain(card);
    expect(graveyard(game, A)).not.toContain(card);
  });

  it("stays in the graveyard after combat damage alone, or damage to you", () => {
    const { game, a } = table();
    const card = toGraveyard(game, NAME);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    nextTurn(game, "draw");
    expect(graveyard(game, A)).toContain(card);
  });

  it("reads last turn only: damage two turns ago doesn't return it", () => {
    const { game } = table();
    const card = toGraveyard(game, NAME);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)]);
    // Back to the graveyard after bob's upkeep returned it.
    nextTurn(game, "draw");
    expect(hand(game, A)).toContain(card);
    game.debugMove(card, "graveyard");
    nextTurn(game, "draw");
    expect(graveyard(game, A)).toContain(card);
  });
});
