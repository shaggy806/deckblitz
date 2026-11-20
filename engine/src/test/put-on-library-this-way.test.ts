/**
 * The Spot, Living Portal: "When The Spot enters, exile up to one target
 * nonland permanent and up to one target nonland permanent card from a
 * graveyard. When The Spot dies, put him on the bottom of his owner's library.
 * If you do, return the exiled cards to their owners' hands."
 *
 * "If you do" after putting a card into a library is `thisWay:
 * "put-into-library"` (the `cards-put-into-library` event), here off a dies
 * trigger's `put-on-library` of the card in the graveyard. The exiled cards
 * are linked to the battlefield stint the trigger refers to (rule 607.2a), so
 * they're still found once The Spot has moved on. A token Spot ceases to exist
 * in the graveyard (rule 111.7): nothing goes into a library, so the exiled
 * cards stay (the ruling).
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  hand,
  lands,
  named,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("The Spot, Living Portal", () => {
  it("exiles a nonland permanent and a graveyard card, and returns both to their owners' hands when he goes to the bottom", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const ogre = toGraveyard(game, "Gray Ogre", B);
    lands(game, "Plains", 3);
    lands(game, "Swamp", 2);
    pickTargets(a, giant, ogre);
    const spot = toHand(game, "The Spot, Living Portal");
    cast(game, spot);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, ogre)).toBe("exile");

    destroy(game, spot);
    const library = game.state.zones.perPlayer[A].library;
    expect(zone(game, spot)).toBe("library");
    expect(library[library.length - 1]).toBe(spot);
    expect(hand(game, B)).toEqual(expect.arrayContaining([giant, ogre]));
  });

  it("can't target a land card in a graveyard, and takes nothing for a declined slot", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest", B);
    const ogre = toGraveyard(game, "Gray Ogre", B);
    lands(game, "Plains", 3);
    lands(game, "Swamp", 2);
    const seen = watchTargets(a);
    cast(game, toHand(game, "The Spot, Living Portal"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[1]).toContain(ogre);
    expect(seen.offered[1]).not.toContain(forest);
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("leaves the exiled cards in exile when he isn't put into a library (a token Spot)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    // The card copied sits in a graveyard (no legend rule), so the copy's
    // graveyard slot has it to target; Alice declines that slot.
    const spot = toGraveyard(game, "The Spot, Living Portal");
    pickTargets(a, giant, null);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(spot)]);
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    const token = named(game, "The Spot, Living Portal").find((id) => game.state.objects[id].isToken === true);
    expect(token).toBeDefined();
    destroy(game, token!);
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game, B)).not.toContain(giant);
  });
});
