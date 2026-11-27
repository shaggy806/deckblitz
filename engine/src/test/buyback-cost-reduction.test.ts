/**
 * "Buyback costs cost {2} less" (Memory Crystal): the static's
 * `buybackCostReduction`, generic mana off a buyback cost (rule 702.27a) as
 * it's added to the spell's total cost (601.2f), read by `kickerCostNow`.
 * Only the buyback cost's own generic mana, never below {0}, for every
 * player (its rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

const bought = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).find((l) => l.kind === "cast-spell" && l.card === card && l.kicked === true);

describe("Memory Crystal", () => {
  it("takes {2} off Searing Touch's buyback {4}", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const touch = toHand(game, "Searing Touch");
    expect(bought(game, touch)).toBeUndefined();
    spawn(game, "Memory Crystal");
    const offer = bought(game, touch);
    expect(offer?.kind === "cast-spell" ? offer.kickerCost : undefined).toBe("{2}");
    cast(game, touch, { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(19);
    expect(zone(game, touch)).toBe("hand");
  });

  it("reduces only the buyback cost's generic mana: two take {4} off Brush with Death's {2}{B}{B}, leaving {B}{B}", () => {
    const { game } = table();
    spawn(game, "Memory Crystal");
    spawn(game, "Memory Crystal", B);
    lands(game, "Swamp", 4);
    const brush = toHand(game, "Brush with Death");
    // {2}{B} and {B}{B}: five, the spell's own {2} untouched.
    expect(bought(game, brush)).toBeUndefined();
    lands(game, "Swamp", 1);
    const offer = bought(game, brush);
    expect(offer?.kind === "cast-spell" ? offer.kickerCost : undefined).toBe("{B}{B}");
  });

  it("leaves the rest of the buyback cost to pay (an opponent's Crystal counting, above)", () => {
    const { game } = table();
    spawn(game, "Memory Crystal");
    lands(game, "Mountain", 1);
    const touch = toHand(game, "Searing Touch");
    expect(bought(game, touch)).toBeUndefined();
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === touch && l.kicked !== true)).toBe(true);
  });
});
