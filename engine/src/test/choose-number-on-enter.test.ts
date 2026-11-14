/**
 * "As this creature enters, choose a number" with nothing bounding it
 * (`CardDefinition.chooseNumberOnEnter` — Sanctum Prelate): a `choose-number`
 * from 0 with no upper bound (rule 107.1c), asked as it's about to enter
 * (rule 614.12) and kept as its `chosenOnEnter`, which a prohibition's
 * `{ chosenNumber: true }` amount reads. An X spell's mana value counts the X
 * announced for it (rule 202.3e, the card's ruling).
 */
import { describe, expect, it } from "vitest";

import type { ChooseNumberOffer } from "../controller.js";
import { A, B, cast, lands, nextTurn, ref, table, toHand, zone } from "./harness.js";

describe("Sanctum Prelate", () => {
  it("asks for any number from 0 up, with no upper bound, and keeps it", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const offers: ChooseNumberOffer[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offers.push(offer);
      return 25;
    };
    const prelate = toHand(game, "Sanctum Prelate");
    cast(game, prelate);
    expect(offers).toHaveLength(1);
    expect(offers[0].min).toBe(0);
    expect(offers[0].max).toBeUndefined();
    expect(zone(game, prelate)).toBe("battlefield");
    expect(game.state.objects[prelate].chosenOnEnter).toBe("25");
  });

  it("bars noncreature spells of the chosen mana value, for every player, and nothing else", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    a.chooseNumberFn = () => 1;
    cast(game, toHand(game, "Sanctum Prelate"));
    nextTurn(game); // Bob's
    lands(game, "Mountain", 2, B);
    lands(game, "Forest", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] })).toThrow(/Sanctum Prelate/);
    // A creature spell of that mana value, and a noncreature spell of another.
    cast(game, toHand(game, "Llanowar Elves", B), { player: B });
    cast(game, toHand(game, "Searing Spear", B), { player: B, targets: [ref(A)] });
    expect(game.state.players[A].life).toBe(17);
  });

  it("bars a 0 too, which a mana value of nothing is", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    a.chooseNumberFn = () => 0;
    cast(game, toHand(game, "Sanctum Prelate"));
    expect(() => cast(game, toHand(game, "Mishra's Bauble", A))).toThrow(/Sanctum Prelate/);
  });

  it("reads an X spell's mana value with the X announced (its ruling)", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    a.chooseNumberFn = () => 3;
    cast(game, toHand(game, "Sanctum Prelate"));
    nextTurn(game);
    lands(game, "Mountain", 4, B);
    const fireball = toHand(game, "Fireball", B);
    // {X}{R} with X = 2 is mana value 3: barred.
    expect(() => cast(game, fireball, { player: B, x: 2, targets: [ref(A)] })).toThrow();
    // X = 3 is mana value 4: allowed.
    cast(game, fireball, { player: B, x: 3, targets: [ref(A)] });
    expect(game.state.players[A].life).toBe(17);
  });
});
