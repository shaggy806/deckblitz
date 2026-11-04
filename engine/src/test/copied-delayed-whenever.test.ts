/**
 * A copy of a spell ceases to exist as it leaves the stack (rule 707.10a) and is
 * still the source of the delayed ability it set up (603.7d), which keeps its
 * stated duration (603.7b): `DelayedTrigger.sourceCopy`.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, nextTurn, ref, table, toHand } from "./harness.js";

describe("a copied spell's delayed `whenever`", () => {
  it("Twincast on Glimpse of Nature draws twice, each time, for this turn only", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 3);
    const glimpse = toHand(game, "Glimpse of Nature");
    cast(game, glimpse, { settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(glimpse)] });

    const before = hand(game, A).length;
    cast(game, toHand(game, "Llanowar Elves"));
    expect(hand(game, A).length).toBe(before + 2);

    const again = hand(game, A).length;
    cast(game, toHand(game, "Llanowar Elves"));
    expect(hand(game, A).length).toBe(again + 2);

    nextTurn(game);
    nextTurn(game); // Alice's next
    const later = hand(game, A).length;
    cast(game, toHand(game, "Llanowar Elves"));
    expect(hand(game, A).length).toBe(later);
  });

  it("its trigger on the stack, with no source left, can be viewed", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const glimpse = toHand(game, "Glimpse of Nature");
    cast(game, glimpse, { settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(glimpse)] });
    cast(game, toHand(game, "Llanowar Elves"), { settle: false });
    expect(game.state.zones.shared.stack.length).toBeGreaterThanOrEqual(3); // the Elves and two triggers
    for (const seat of [A, B]) {
      const view = game.viewFor(seat);
      expect(view.zones.stack).toEqual(game.state.zones.shared.stack);
      for (const id of view.zones.stack) expect(view.objects[id]).toBeDefined();
    }
  });

  it("a copy of an opponent's spell is its copier's ability: \"you\" is them (603.7d)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3, B);
    const glimpse = toHand(game, "Glimpse of Nature");
    cast(game, glimpse, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Twincast", B), { player: B, targets: [ref(glimpse)] });

    // Alice's creature spell: the original's draw, none for Bob's.
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Llanowar Elves"));
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs);

    // Bob's creature spell, with flash: the copy's draw, none for Alice's.
    const sailor = toHand(game, "Spectral Sailor", B);
    const mineNow = hand(game, A).length;
    const theirsNow = hand(game, B).length;
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, sailor, { player: B });
    expect(hand(game, B).length).toBe(theirsNow); // one cast, one drawn
    expect(hand(game, A).length).toBe(mineNow);
  });
});
