/**
 * `grantPtPerCount.fromAffectedController` on an Aura: Death's Approach's
 * "-X/-X, where X is the number of creature cards in its controller's
 * graveyard" counts the enchanted creature's controller's graveyard, not the
 * Aura's controller's.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pt, ref, spawn, table, toGraveyard, toHand } from "./harness.js";

describe("Death's Approach", () => {
  it("counts the creature cards in the enchanted creature's controller's graveyard", () => {
    const { game } = table();
    const giant = spawn(game, "Craw Wurm", B);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", B);
    // The Aura's controller's graveyard doesn't count.
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Swamp", 1, A);
    cast(game, toHand(game, "Death's Approach"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 2 });
    toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
  });

  it("on its own creature, its own graveyard", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", A);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1, A);
    cast(game, toHand(game, "Death's Approach"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 5, toughness: 3 });
  });
});
