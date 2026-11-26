/**
 * "Draws cards equal to the number of cards in their hand, then discards that
 * many": the number counted once, before the draw changes it (`with-x`) —
 * Laquatus's Creativity.
 */
import { describe, expect, it } from "vitest";

import { B, cast, graveyard, hand, lands, ref, table, toHand } from "./harness.js";

describe("Laquatus's Creativity", () => {
  it("the target draws as many cards as their hand holds, then discards that many", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Island", 5);
    for (let i = 0; i < 3; i += 1) toHand(game, "Grizzly Bears", B);
    const spell = toHand(game, "Laquatus's Creativity");
    const before = graveyard(game, B).length;
    cast(game, spell, { targets: [ref(B)] });
    // Three drawn (six in hand), three discarded — not the six it then held.
    expect(hand(game, B)).toHaveLength(3);
    expect(graveyard(game, B).length - before).toBe(3);
  });

  it("an empty hand draws and discards nothing", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Island", 5);
    const spell = toHand(game, "Laquatus's Creativity");
    const library = game.state.zones.perPlayer[B].library.length;
    cast(game, spell, { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(0);
    expect(game.state.zones.perPlayer[B].library.length).toBe(library);
  });
});
