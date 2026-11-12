/**
 * The `loses-life` trigger's `batched` — "whenever one or more opponents
 * lose life", once per simultaneous loss (rule 603.2c) — Emet-Selch of the
 * Third Seat, whose cast is limited to once each turn (not the trigger).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import { A, B, cast, graveyard, hand, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** Each offer recorded; the seat casts on the offers whose index is in `castOn`. */
function offers(seat: ScriptedController, castOn: readonly number[]): Offer[] {
  const seen: Offer[] = [];
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    seen.push(offer);
    if (!castOn.includes(seen.length - 1)) return null;
    const way = offer.casts[0];
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect" };
  };
  return seen;
}

describe("Emet-Selch of the Third Seat", () => {
  it("triggers once when three opponents lose life at once", () => {
    const seats = table({ players: 4 });
    const { game } = seats;
    spawn(game, "Emet-Selch of the Third Seat");
    toGraveyard(game, "Divination");
    lands(game, "Swamp", 6);
    lands(game, "Island", 1);
    const seen = offers(seats.a, []);
    cast(game, toHand(game, "Zof Consumption"));
    expect(seen.length).toBe(1);
  });

  it("casts the card for {2} less and exiles it; only once each turn, though it triggers again", () => {
    const seats = table({ players: 4 });
    const { game } = seats;
    spawn(game, "Emet-Selch of the Third Seat");
    const divination = toGraveyard(game, "Divination");
    toGraveyard(game, "Divination");
    lands(game, "Swamp", 4);
    lands(game, "Island", 1);
    const seen = offers(seats.a, [0]);
    const before = hand(game).length;
    cast(game, toHand(game, "Sovereign's Bite"), { targets: [ref(B)] });
    expect(seen.length).toBe(1);
    expect(zone(game, divination)).toBe("exile");
    expect(hand(game).length).toBe(before + 2);
    // A second loss this turn: it triggers, but nothing is offered.
    cast(game, toHand(game, "Sovereign's Bite"), { targets: [ref(B)] });
    expect(seen.length).toBe(1);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Divination").length).toBe(1);
  });
});
