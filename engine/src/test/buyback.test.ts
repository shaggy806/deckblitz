/**
 * Buyback (rule 702.27a): "You may pay an additional [cost] as you cast this
 * spell" and "If the buyback cost was paid, put this spell into its owner's
 * hand instead of into that player's graveyard as it resolves." Authored as a
 * kicker under the keyword `buyback`: the kicked cast pays it. A spell that
 * doesn't resolve (countered, or every target gone — Elvish Fury's ruling)
 * goes to the graveyard, and a copy ceases to exist.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, hand, lands, life, pt, ref, settle, spawn, table, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).flatMap((l) => (l.kind === "cast-spell" && l.card === card ? [l] : []));

describe("buyback", () => {
  it("is offered as a kicked cast labelled buyback, only when its cost can be paid too", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const touch = game.debugSpawn("Searing Touch", A, "hand");
    expect(offers(game, touch).map((o) => o.kicked === true)).toEqual([false]);
    lands(game, "Mountain", 1);
    const bought = offers(game, touch).find((o) => o.kicked === true);
    expect(bought?.kickerKeyword).toBe("buyback");
    expect(bought?.kickerCost).toBe("{4}");
  });

  it("puts the spell into its owner's hand as it resolves; unpaid, into the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const touch = game.debugSpawn("Searing Touch", A, "hand");
    cast(game, touch, { targets: [ref(B)], kicked: true });
    expect(life(game, B)).toBe(19);
    expect(zone(game, touch)).toBe("hand");
    expect(hand(game)).toContain(touch);
    cast(game, touch, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, touch)).toBe("graveyard");
  });

  it("a spell that doesn't resolve isn't returned (Elvish Fury's ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bear = spawn(game, "Grizzly Bears");
    const fury = game.debugSpawn("Elvish Fury", A, "hand");
    cast(game, fury, { targets: [ref(bear)], kicked: true, settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bear)]);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, fury)).toBe("graveyard");
  });

  it("storm's copies cease to exist; the bought-back original returns (Haze of Rage)", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, game.debugSpawn("Searing Touch", A, "hand"), { targets: [ref(B)] });
    const haze = game.debugSpawn("Haze of Rage", A, "hand");
    cast(game, haze, { kicked: true });
    // One spell cast before it: the original and one copy, +1/+0 each.
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    expect(zone(game, haze)).toBe("hand");
    const copies = Object.values(game.state.objects).filter((o) => o.cardName === "Haze of Rage");
    expect(copies).toHaveLength(1);
  });

  it("goes with an additional cost: Worthy Cause gains the sacrificed creature's toughness", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant"); // 3/3
    const cause = game.debugSpawn("Worthy Cause", A, "hand");
    cast(game, cause, { kicked: true });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(23);
    expect(zone(game, cause)).toBe("hand");
  });

  it("convoke can pay the buyback cost too (Sprout Swarm)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears");
    const swarm = game.debugSpawn("Sprout Swarm", A, "hand");
    expect(offers(game, swarm).some((o) => o.kicked === true)).toBe(true);
  });

  it("Reiterate bought back copies the spell and returns", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const touch = game.debugSpawn("Searing Touch", A, "hand");
    cast(game, touch, { targets: [ref(B)], settle: false });
    const again = game.debugSpawn("Reiterate", A, "hand");
    cast(game, again, { targets: [ref(touch)], kicked: true });
    expect(life(game, B)).toBe(18);
    expect(zone(game, again)).toBe("hand");
  });
});
