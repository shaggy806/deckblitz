/**
 * An activated ability whose mana cost is {1} for each counter on its source
 * (rules 602.2b, 601.2f — fixed as it's activated): Skeleton Scavengers' "Pay
 * {1} for each +1/+1 counter on this creature: Regenerate this creature. When
 * it regenerates this way, put a +1/+1 counter on it." `{0}` and the ability's
 * own `costIncrease`; with no counters it costs nothing (rule 118.5).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, cast, counters, destroy, lands, pt, settle, spawn, table, toHand, zone } from "./harness.js";

const untapped = (game: Game, ids: readonly ObjectId[]) => ids.filter((id) => game.state.objects[id].tapped !== true).length;

describe("Skeleton Scavengers", () => {
  it("enters with a +1/+1 counter, so its regeneration costs {1}; regenerating puts another, and the next costs {2}", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 6);
    const skeleton = toHand(game, "Skeleton Scavengers");
    cast(game, skeleton);
    expect(zone(game, skeleton)).toBe("battlefield");
    expect(counters(game, skeleton)).toBe(1);
    expect(pt(game, skeleton)).toEqual({ power: 1, toughness: 1 });
    activate(game, skeleton);
    expect(untapped(game, swamps)).toBe(2);
    expect(game.state.objects[skeleton].regenerationShields).toBe(1);
    destroy(game, skeleton, B);
    settle(game);
    expect(zone(game, skeleton)).toBe("battlefield");
    expect(counters(game, skeleton)).toBe(2);
    // Two counters now: {2}, and two Swamps are left.
    activate(game, skeleton);
    expect(untapped(game, swamps)).toBe(0);
    expect(() => activate(game, skeleton)).toThrow();
  });

  it("with no counters it costs nothing", () => {
    const { game } = table();
    // Held up by Glorious Anthem, a 1/1 with no counter at all.
    spawn(game, "Glorious Anthem");
    const skeleton = spawn(game, "Skeleton Scavengers");
    // Its entering counter taken off, as a -1/-1 counter would (rule 704.5q).
    delete game.state.objects[skeleton].counters["+1/+1"];
    expect(counters(game, skeleton)).toBe(0);
    expect(zone(game, skeleton)).toBe("battlefield");
    activate(game, skeleton);
    expect(game.state.objects[skeleton].regenerationShields).toBe(1);
    destroy(game, skeleton, B);
    settle(game);
    expect(zone(game, skeleton)).toBe("battlefield");
    expect(counters(game, skeleton)).toBe(1);
  });
});
