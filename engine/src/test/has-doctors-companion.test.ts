import { describe, expect, it } from "vitest";
import { B, cast, hand, lands, spawn, table, toHand, toStep } from "./harness.js";

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
