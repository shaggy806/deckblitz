/**
 * "Discard any number of cards" (the `discard` effect's `anyNumber` — Chance,
 * Neheb): the player picks how many, none to their whole hand; "draw that
 * many" reads what was discarded this way. The decision's `upTo` caps the
 * pick at the hand and allows fewer.
 */
import { describe, expect, it } from "vitest";

import { A, cast, graveyard, hand, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("discard any number of cards", () => {
  it("Chance discards the chosen cards and draws that many", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.slice(0, 3).map((c) => c.id);
    const card = toGraveyard(game, "Leave // Chance");
    cast(game, card, { face: 2, via: "aftermath" });
    expect(hand(game).length).toBe(before);
    expect(graveyard(game, A).length).toBe(3);
    expect(zone(game, card)).toBe("exile");
  });

  it("none is an answer, and draws nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [];
    cast(game, toGraveyard(game, "Leave // Chance"), { face: 2, via: "aftermath" });
    expect(hand(game).length).toBe(before);
    expect(graveyard(game, A)).toEqual([]);
  });

  it("offers the whole hand as the most, and refuses more", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    let offered = -1;
    a.chooseDiscardsFn = (cards, count) => {
      offered = count;
      return cards.map((c) => c.id);
    };
    const size = hand(game).length;
    cast(game, toGraveyard(game, "Leave // Chance"), { face: 2, via: "aftermath" });
    expect(offered).toBe(size);
    expect(hand(game).length).toBe(size);
  });

  it("Leave returns any number of permanents you own", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    cast(game, toHand(game, "Leave // Chance"), { face: 1, targets: mine.map((id) => ref(id)) });
    expect(mine.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
  });
});
