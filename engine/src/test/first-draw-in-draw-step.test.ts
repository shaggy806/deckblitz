/**
 * "Whenever you draw your first card during each of your draw steps" — the
 * `draws` trigger's `firstInDrawStep`: the first card its player draws in
 * their own draw step (rule 504.1's draw, or the first after it was
 * replaced), not one drawn later in that step, in another step, or in an
 * opponent's draw step. Wiretapping, with its hideaway payoff at nine cards.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, enter, hand, life, pickFromZone, ref, settle, table, toLibrary, toStep, zone } from "./harness.js";

describe("Wiretapping", () => {
  it("draws a card off the first card of your draw step, and only that one", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const shock = toLibrary(game, "Shock");
    pickFromZone(a, shock);
    enter(game, "Wiretapping");
    expect(zone(game, shock)).toBe("exile");
    const start = hand(game).length;
    // A draw outside the draw step doesn't trigger it.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).length).toBe(start + 1);
    // Bob's draw step isn't yours; your draw step's first card is.
    toStep(game, "draw");
    settle(game);
    expect(hand(game).length).toBe(start + 1 + 1 + 1);
    // A second card drawn in the same draw step doesn't.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).length).toBe(start + 4);
    // Fewer than nine cards in hand: the exiled card stays where it is.
    expect(zone(game, shock)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("with nine or more cards in hand after its draw, plays the exiled card free", () => {
    const { game, a } = table();
    const shock = toLibrary(game, "Shock");
    pickFromZone(a, shock);
    enter(game, "Wiretapping");
    expect(zone(game, shock)).toBe("exile");
    expect(hand(game).length).toBe(8);
    a.chooseCastNowFn = (_v, offer) => ({
      type: "cast-spell",
      player: A,
      card: (offer.casts[0] as unknown as { card: ObjectId }).card,
      targets: [ref(B)],
      via: "effect",
      free: true,
    });
    toStep(game, "draw");
    settle(game);
    // Eight, the draw step's card, Wiretapping's: ten.
    expect(hand(game).length).toBe(10);
    expect(life(game, B)).toBe(18);
    expect(zone(game, shock)).toBe("graveyard");
  });
});
