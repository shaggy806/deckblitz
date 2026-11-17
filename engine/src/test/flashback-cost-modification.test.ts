/**
 * A cost modification that reaches only a spell cast for its flashback cost
 * (`SpellCastClause.via` — rules 702.34a, 601.2f): Catalyst Stone's
 * "Flashback costs you pay cost {2} less. Flashback costs your opponents pay
 * cost {2} more." A flashback granted by another card is a flashback cost
 * all the same (Snapcaster Mage's); jump-start, cast from the graveyard the
 * same way, isn't one, and nor is the card's mana cost paid from the hand.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  enter,
  hand,
  lands,
  nextTurn,
  pickTargets,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Catalyst Stone", () => {
  it("your flashback cost {2} less", () => {
    const { game } = table();
    spawn(game, "Catalyst Stone");
    lands(game, "Island", 1);
    const twice = toGraveyard(game, "Think Twice");
    const before = hand(game, A).length;
    cast(game, twice, { via: "flashback" });
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, twice)).toBe("exile");
  });

  it("not the mana cost paid from the hand", () => {
    const { game } = table();
    spawn(game, "Catalyst Stone");
    lands(game, "Island", 1);
    const twice = toHand(game, "Think Twice");
    expect(() => cast(game, twice)).toThrow(/mana|afford|pay/i);
  });

  it("a flashback another card grants is a flashback cost too", () => {
    const { game, a } = table();
    spawn(game, "Catalyst Stone");
    const divination = toGraveyard(game, "Divination");
    pickTargets(a, divination);
    enter(game, "Snapcaster Mage");
    lands(game, "Island", 1);
    const before = hand(game, A).length;
    cast(game, divination, { via: "flashback" });
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("jump-start isn't flashback", () => {
    const { game } = table();
    spawn(game, "Catalyst Stone");
    lands(game, "Island", 2);
    toHand(game, "Island");
    const insight = toGraveyard(game, "Chemister's Insight");
    expect(() => cast(game, insight, { via: "flashback" })).toThrow(/mana|afford|pay/i);
  });

  it("your opponents' flashback cost {2} more", () => {
    const { game } = table();
    spawn(game, "Catalyst Stone");
    nextTurn(game);
    lands(game, "Island", 4, B);
    const twice = toGraveyard(game, "Think Twice", B);
    expect(() => cast(game, twice, { via: "flashback", player: B })).toThrow(/mana|afford|pay/i);
    lands(game, "Island", 1, B);
    cast(game, twice, { via: "flashback", player: B });
    expect(zone(game, twice)).toBe("exile");
  });
});
