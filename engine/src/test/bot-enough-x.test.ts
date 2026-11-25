/**
 * The X a bot casts a delve "counter unless its controller pays {X}" spell at
 * (`bot/enough-x.ts`): one more than that player could pay, not everything a
 * full graveyard buys. A bot with 43 cards in its graveyard cast Logic Knot at
 * X = 46 against a Swan Song and exiled all 43 (a live game, 2026-11-24).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { candidateActions } from "../bot/candidates.js";
import { enoughX, manaPayableNow } from "../bot/enough-x.js";
import { aimOffer } from "../bot/eval-bot.js";
import { invalidateComputedCache } from "../characteristics.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, lands, table, toGraveyard, toHand } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const GRAVEYARD = 20;

/** Alice's Colossal Dreadmaw on the stack with three of her nine Forests
 * untapped; Bob has priority with `counter` in hand, five Islands and twenty
 * cards in his graveyard. */
function board(counter: string): { game: Game; card: ObjectId; offer: CastOffer } {
  const { game } = table();
  lands(game, "Forest", 9);
  lands(game, "Island", 5, B);
  for (let i = 0; i < GRAVEYARD; i += 1) toGraveyard(game, "Island", B);
  const card = toHand(game, counter, B);
  cast(game, toHand(game, "Colossal Dreadmaw"), { settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  const offer = game.legalActions(B).find((l): l is CastOffer => l.kind === "cast-spell" && l.card === card);
  if (offer === undefined) throw new Error(`${counter} isn't castable`);
  return { game, card, offer };
}

describe("enough X for a delve pay-or-counter spell", () => {
  it("counts what the spell's controller could still pay", () => {
    const { game } = board("Logic Knot");
    expect(manaPayableNow(game.state, game.registry, A)).toBe(3);
  });

  it("caps Logic Knot's X at one more than that", () => {
    const { game, offer } = board("Logic Knot");
    // Five Islands pay {U}{U} and three of X; the graveyard pays the rest.
    expect(offer.xCost?.maxX).toBe(3 + GRAVEYARD);
    expect(enoughX(game.state, game.registry, offer)).toBe(4);
  });

  it("has v2 cast it at that X, exiling no more than X cards", () => {
    const { game, offer } = board("Logic Knot");
    const [action] = candidateActions(aimOffer(game.state, game.registry, B, offer), B);
    if (action?.type !== "cast-spell") throw new Error("no cast candidate");
    expect(action.xValue).toBe(4);
    expect(action.delve?.length).toBe(4);
    game.dispatch(action);
    expect(graveyard(game, B)).toHaveLength(GRAVEYARD - 4);
  });

  it("has v1 cast it at that X too", () => {
    const { game } = board("Logic Knot");
    const view = { player: B, state: game.state, legalActions: () => game.legalActions(B) };
    const action = new HeuristicBotController(B, game.registry).act(view);
    expect(action).toMatchObject({ type: "cast-spell", xValue: 4 });
  });

  it("never goes below what mana alone pays", () => {
    const { game, offer } = board("Logic Knot");
    // Alice's Forests tapped: she can pay nothing, and Bob's mana still buys 3.
    for (const id of game.state.zones.shared.battlefield) {
      const object = game.state.objects[id];
      if (object.controller === A) object.tapped = true;
    }
    invalidateComputedCache();
    expect(enoughX(game.state, game.registry, offer)).toBe(3);
  });

  it("leaves an X spell without delve alone (Syncopate)", () => {
    const { game, offer } = board("Syncopate");
    expect(enoughX(game.state, game.registry, offer)).toBeUndefined();
    const [action] = candidateActions(aimOffer(game.state, game.registry, B, offer), B);
    expect(action).toMatchObject({ type: "cast-spell", xValue: 4 });
  });
});
