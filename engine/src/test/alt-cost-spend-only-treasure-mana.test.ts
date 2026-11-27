/**
 * "You may pay {R}{G} rather than pay this spell's mana cost. Spend only mana
 * produced by Treasures to cast it this way" (Security Rhox): an alternative
 * cost (rule 118.9) whose mana must come from Treasures — read off each unit's
 * origin as it was made (`alternativeCost.spendOnlyManaFrom`). The normal cost
 * takes any mana.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, cast, lands, named, settle, table, toHand, zone } from "./harness.js";

const treasures = (game: Game, player: PlayerId, n: number): ObjectId[] => {
  const before = new Set(named(game, "Treasure Token", player));
  game.debugApplyEffect(player, { kind: "create-token", token: "Treasure Token", count: n, separate: true }, []);
  settle(game);
  return named(game, "Treasure Token", player).filter((id) => !before.has(id));
};

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card) as Extract<
    ReturnType<Game["legalActions"]>[number],
    { kind: "cast-spell" }
  >[];

describe("an alternative cost paid only with Treasure mana (Security Rhox)", () => {
  it("two Treasures cast it for {R}{G}", () => {
    const { game } = table();
    const made = treasures(game, A, 2);
    const rhox = toHand(game, "Security Rhox");
    expect(castOffers(game, rhox).some((o) => o.altCost === true)).toBe(true);
    cast(game, rhox, { altCost: true });
    expect(zone(game, rhox)).toBe("battlefield");
    expect(named(game, "Treasure Token", A).filter((id) => made.includes(id))).toEqual([]);
  });

  it("a Mountain and a Forest can't pay it this way", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const rhox = toHand(game, "Security Rhox");
    expect(castOffers(game, rhox)).toEqual([]);
    expect(() => cast(game, rhox, { altCost: true })).toThrow(/mana|pay|afford/i);
    expect(zone(game, rhox)).toBe("hand");
  });

  it("one Treasure and a Forest can't either", () => {
    const { game } = table();
    treasures(game, A, 1);
    lands(game, "Forest", 1);
    const rhox = toHand(game, "Security Rhox");
    expect(castOffers(game, rhox).some((o) => o.altCost === true)).toBe(false);
  });

  it("its mana cost takes any mana, Treasures' included", () => {
    const { game } = table();
    treasures(game, A, 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const rhox = toHand(game, "Security Rhox");
    cast(game, rhox, {});
    expect(zone(game, rhox)).toBe("battlefield");
  });
});
