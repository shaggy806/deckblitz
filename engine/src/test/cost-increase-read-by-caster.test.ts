/**
 * A spell cost increase whose amount is read from the caster's side
 * (`costModification.amountsReadByCaster`): Hum of the Radix's "Each
 * artifact spell costs {1} more to cast for each artifact its controller
 * controls" — the controller of the spell, the player casting it (rule
 * 601.2a), whoever controls the Hum, worked out as it's cast (601.2f).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, spawn, table, toHand, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);

describe("a cost increase counted for the caster (Hum of the Radix)", () => {
  it("counts the caster's artifacts, not the Hum's controller's", () => {
    const { game } = table();
    spawn(game, "Hum of the Radix", B);
    for (const name of ["Ornithopter", "Memnite", "Sol Ring"]) spawn(game, name, B);
    const ring = toHand(game, "Sol Ring");
    lands(game, "Wastes", 1);
    // Alice controls no artifacts: {1} and no more, though Bob has three.
    expect(castable(game, ring)).toBe(true);
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("adds {1} for each artifact the caster controls", () => {
    const { game } = table();
    spawn(game, "Hum of the Radix", B);
    spawn(game, "Ornithopter");
    spawn(game, "Memnite");
    const ring = toHand(game, "Sol Ring");
    lands(game, "Wastes", 2);
    expect(castable(game, ring)).toBe(false);
    lands(game, "Wastes", 1);
    expect(castable(game, ring)).toBe(true);
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("leaves other spells alone", () => {
    const { game } = table();
    spawn(game, "Hum of the Radix");
    spawn(game, "Ornithopter");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(castable(game, bears)).toBe(true);
  });
});
