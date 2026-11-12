/**
 * `opponent-controls`' `atMost` — "if an opponent controls **no** basic lands"
 * (Hagra Mauling): some one opponent whose own count is within the bounds.
 */
import { describe, expect, it } from "vitest";

import { B, C, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);

describe("opponent-controls atMost — Hagra Mauling", () => {
  it("costs {1} less while some one opponent controls no basic lands", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 3);
    spawn(game, "Plains", B);
    const wastes = spawn(game, "Wastes", C);
    const bears = spawn(game, "Grizzly Bears", B);
    const mauling = toHand(game, "Hagra Mauling");
    // Both opponents control a basic land: full price, {2}{B}{B}.
    expect(castable(game, mauling)).toBe(false);
    game.debugApplyEffect(C, { kind: "destroy", target: 0 }, [ref(wastes)]);
    expect(zone(game, wastes)).toBe("graveyard");
    // A nonbasic land doesn't count.
    spawn(game, "Bayou", C);
    expect(castable(game, mauling)).toBe(true);
    cast(game, mauling, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});
