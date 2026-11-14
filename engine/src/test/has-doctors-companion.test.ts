import { describe, expect, it } from "vitest";
import { A, B, cast, enter, hand, lands, settle, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

// Doctor's companion as a filter (rule 702.124m): `hasKeyword:
// "doctors-companion"`, a `CARD_KEYWORD_READS` row off the definition's
// `pairing`.

describe("Rose Noble — a Doctor spell or a creature spell with doctor's companion", () => {
  it("draws for a Doctor and for a companion, not for another creature", () => {
    const { game } = table();
    spawn(game, "Rose Noble");
    lands(game, "Island", 6);
    lands(game, "Plains", 6);
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "The Eleventh Doctor"));
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Barbara Wright"));
    expect(hand(game).length).toBe(before + 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(hand(game).length).toBe(before + 2);
  });

  it("An Unearthly Child reveals until a card with doctor's companion, skipping other creatures", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const barbara = toLibrary(game, "Barbara Wright");
    const island = toLibrary(game, "Island");
    const ox = toLibrary(game, "Runeclaw Bear");
    enter(game, "An Unearthly Child");
    settle(game);
    expect(zone(game, barbara)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
    // The rest (Runeclaw Bear and the Island) go to the bottom; index 0 is the top.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(bears);
    expect(library.slice(-2)).toEqual(expect.arrayContaining([island, ox]));
  });

  it("An Unearthly Child takes a Doctor or a Vehicle too", () => {
    for (const name of ["The Eleventh Doctor", "Smuggler's Copter"]) {
      const { game } = table();
      const found = toLibrary(game, name);
      toLibrary(game, "Grizzly Bears");
      enter(game, "An Unearthly Child");
      settle(game);
      expect(zone(game, found)).toBe("hand");
    }
  });

  it("an opponent's Doctor draws nothing", () => {
    const { game } = table();
    spawn(game, "Rose Noble");
    lands(game, "Island", 3, B);
    lands(game, "Plains", 3, B);
    toStep(game, "precombat-main", B);
    const before = hand(game).length;
    cast(game, toHand(game, "The Eleventh Doctor", B), { player: B });
    expect(hand(game).length).toBe(before);
  });
});
