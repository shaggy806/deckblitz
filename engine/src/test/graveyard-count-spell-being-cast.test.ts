/**
 * A spell's cost read off the graveyards leaves the spell itself out: cast
 * from a graveyard, it's on the stack as its cost is worked out (rules
 * 601.2a, 601.2f), wherever the card sits while the cast is only offered
 * (`pricedSpell`). Oskar, Rubbish Reclaimer's "{1} less for each different
 * mana value among cards in your graveyard" (an `aggregate` over
 * `"graveyards"`, which now honours `except` there too), and Emrakul, the
 * Promised End's "for each card type among cards in your graveyard".
 *
 * Also Oskar's "whenever you discard a nonland card, you may cast it from
 * your graveyard": "it" is the card where the discard put it, followed no
 * further (rule 400.7).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, hand, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === card);

/** Let alice cast `card` from where it is this turn. */
const allow = (game: Game, card: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "grant-play", cards: 0, duration: "end-of-turn" }, [ref(card)]);

describe("Oskar, Rubbish Reclaimer — {1} less for each different mana value in your graveyard", () => {
  it("counts each mana value once, a land's 0 among them, from the hand", () => {
    const { game } = table();
    const oskar = toHand(game, "Oskar, Rubbish Reclaimer");
    toGraveyard(game, "Island");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    // Two values (0 and 1): {1}{U}{B}, out of reach with two lands.
    expect(castable(game, oskar)).toBe(false);
    toGraveyard(game, "Divination");
    // Three (0, 1, 3): {U}{B}.
    expect(castable(game, oskar)).toBe(true);
  });

  it("cast from the graveyard, doesn't count its own mana value", () => {
    const { game } = table();
    const oskar = toGraveyard(game, "Oskar, Rubbish Reclaimer");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    allow(game, oskar);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    // 1 and 3 only — not Oskar's own 5 — so {1}{U}{B}.
    expect(castable(game, oskar)).toBe(false);
    lands(game, "Swamp", 1);
    expect(castable(game, oskar)).toBe(true);
  });

  it("Emrakul, the Promised End cast from the graveyard doesn't count its own creature type", () => {
    const { game } = table();
    const emrakul = toGraveyard(game, "Emrakul, the Promised End");
    toGraveyard(game, "Island");
    toGraveyard(game, "Lightning Bolt");
    allow(game, emrakul);
    // Land and instant, not its own creature: {13} less {2} is {11}, out of
    // reach of ten lands (it would be {10} if it counted itself).
    lands(game, "Wastes", 10);
    expect(castable(game, emrakul)).toBe(false);
    lands(game, "Wastes", 1);
    expect(castable(game, emrakul)).toBe(true);
  });
});

describe("Oskar — whenever you discard a nonland card, you may cast it from your graveyard", () => {
  function board() {
    const t = table();
    spawn(t.game, "Oskar, Rubbish Reclaimer");
    lands(t.game, "Island", 3);
    const card = toHand(t.game, "Divination");
    t.a.chooseDiscardsFn = () => [card];
    const seen = { offers: 0 };
    t.a.chooseCastNowFn = (_v, offer: CastNowOffer): Cast | null => {
      seen.offers += 1;
      return offer.casts.some((c) => c.card === card)
        ? { type: "cast-spell", player: A, card, targets: [], via: offer.casts.find((c) => c.card === card)!.via }
        : null;
    };
    return { ...t, card, seen };
  }

  it("casts the discarded card, paying for it, at any time", () => {
    const { game, card, seen } = board();
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 }, []);
    settle(game);
    expect(seen.offers).toBe(1);
    // Divination left the hand (-1), resolved and drew two (+2).
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, card)).toBe("graveyard");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Island" && game.state.objects[id].tapped)).toHaveLength(3);
  });

  it("can't cast it once it has left the graveyard, even if it's back (rule 400.7)", () => {
    const { game, card, seen } = board();
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 }, []);
    // The discard answered, its trigger waiting: the card leaves and comes back.
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length > 0);
    expect(zone(game, card)).toBe("graveyard");
    game.debugMove(card, "exile");
    game.debugMove(card, "graveyard");
    settle(game);
    expect(seen.offers).toBe(0);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("doesn't trigger on a land", () => {
    const { game, a, seen } = board();
    const land = toHand(game, "Island");
    a.chooseDiscardsFn = () => [land];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 }, []);
    settle(game);
    expect(seen.offers).toBe(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});
