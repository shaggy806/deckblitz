/**
 * Recheck list R7, group A (batch B241): the cards whose coarse dice-rolling
 * need was built. Rolls come from the seeded stream, so each test reads the
 * roll recorded (`GameState.lastRoll`) and checks the row it should apply.
 */
import { describe, expect, it } from "vitest";

import { B, C, cast, lands, spawn, table, toHand, zone } from "./harness.js";

describe("Myrkul's Edict", () => {
  it("applies the d20 row that holds the roll", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const { game } = table({ players: 3, seed });
      const small = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", C)];
      const big = [spawn(game, "Hill Giant", B), spawn(game, "Hill Giant", C)];
      lands(game, "Swamp", 2);
      cast(game, toHand(game, "Myrkul's Edict"));
      const total = game.state.lastRoll!.total;
      const gone = (id: (typeof small)[number]) => zone(game, id) !== "battlefield";
      const lostB = [small[0], big[0]].filter(gone).length;
      const lostC = [small[1], big[1]].filter(gone).length;
      if (total <= 9) {
        seen.add("one");
        expect(lostB + lostC).toBe(1);
      } else {
        seen.add(total === 20 ? "greatest" : "each");
        expect(lostB).toBe(1);
        expect(lostC).toBe(1);
        if (total === 20) {
          expect(gone(big[0])).toBe(true);
          expect(gone(big[1])).toBe(true);
        }
      }
    }
    expect(seen.has("one")).toBe(true);
    expect(seen.has("each")).toBe(true);
  });
});
