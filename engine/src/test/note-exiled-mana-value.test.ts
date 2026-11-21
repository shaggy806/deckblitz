/**
 * "Note the mana value of each card as it's put into exile" and "power is
 * equal to the greatest number noted for it this turn" (Bell Borca, Spectral
 * Sergeant — `StaticAbility.notesExiledManaValues`, `GameObject.notedManaValue`,
 * the `"greatest-noted-mana-value"` count). The rulings: only while it's on
 * the battlefield, each card as it is in exile, 0 before anything is noted
 * this turn.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, nextTurn, pt, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Bell Borca, Spectral Sergeant", () => {
  it("has power 0 until a card is exiled, then the greatest mana value noted this turn", () => {
    const { game } = table();
    const bell = spawn(game, "Bell Borca, Spectral Sergeant");
    expect(pt(game, bell)).toEqual({ power: 0, toughness: 5 });
    lands(game, "Plains", 2);
    // An opponent's creature, mana value 6, then one of mana value 2: the
    // greatest stays.
    const dragon = spawn(game, "Shivan Dragon", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(dragon)] });
    expect(zone(game, dragon)).toBe("exile");
    expect(pt(game, bell).power).toBe(6);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bears)] });
    expect(pt(game, bell).power).toBe(6);
    // The Swords themselves went to the graveyard, not exile; next turn the
    // notes of this turn no longer count.
    nextTurn(game);
    expect(pt(game, bell).power).toBe(0);
  });

  it("notes its upkeep's exiled card, and nothing exiled before it was there", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const dragon = spawn(game, "Shivan Dragon", B);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(dragon)] });
    const bell = spawn(game, "Bell Borca, Spectral Sergeant");
    expect(pt(game, bell).power).toBe(0);
    nextTurn(game); // bob's
    toLibrary(game, "Gray Ogre", A);
    nextTurn(game); // alice's: the upkeep exiles Gray Ogre, mana value 3
    expect(pt(game, bell).power).toBe(3);
  });

  it("has power 0 off the battlefield, and a face-down exiled card notes 0", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bell = spawn(game, "Bell Borca, Spectral Sergeant");
    const hidden = toLibrary(game, "Shivan Dragon", A);
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: true });
    expect(zone(game, hidden)).toBe("exile");
    expect(pt(game, bell).power).toBe(0);
    const dragon = spawn(game, "Shivan Dragon", B);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(dragon)] });
    expect(pt(game, bell).power).toBe(6);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bell)] });
    expect(zone(game, bell)).toBe("exile");
    expect(pt(game, bell).power).toBe(0);
  });
});
