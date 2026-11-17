/**
 * Fighting Chance: a coin flip for each blocking creature, each won
 * preventing all the combat damage that creature would deal this turn. No
 * engine code: `for-each-permanent` over `{ blocking: true }`, a `flip-coin`
 * whose `won` is a `damage-rule` by that creature.
 */

import { describe, expect, it } from "vitest";
import { A, B, cast, lands, spawn, table, toHand, toStep } from "./harness.js";

describe("Fighting Chance", () => {
  it("flips once for each blocker; a won flip stops that blocker's combat damage", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) {
      const { game, a, b } = table({ seed });
      lands(game, "Mountain", 1);
      const giants = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
      const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
      // An unblocked attacker: nothing to flip for.
      const loner = spawn(game, "Hill Giant");
      a.declareAttackersFn = () => [...giants, loner].map((attacker) => ({ attacker, defender: B }));
      b.declareBlockersFn = () => giants.map((attacker, i) => ({ blocker: bears[i], attacker }));
      game.advanceUntil(
        (s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null && s.zones.shared.stack.length === 0,
      );
      const since = game.state.eventLog.length;
      cast(game, toHand(game, "Fighting Chance"));
      const flips = game.state.eventLog.slice(since).filter((e) => e.type === "coin-flipped");
      expect(flips.length).toBe(2);
      for (const flip of flips) expect(flip.type === "coin-flipped" && flip.player).toBe(A);
      const won = flips.filter((e) => e.type === "coin-flipped" && e.won === true).length;
      toStep(game, "postcombat-main", A);
      const unhurt = giants.filter((id) => game.state.objects[id].damageMarked === 0).length;
      expect(unhurt).toBe(won);
      seen.add(`${won}`);
    }
    // Both ways over the seeds.
    expect(seen.size).toBeGreaterThan(1);
  });

  it("with no blocking creature, flips nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const since = game.state.eventLog.length;
    cast(game, toHand(game, "Fighting Chance"));
    expect(game.state.eventLog.slice(since).some((e) => e.type === "coin-flipped")).toBe(false);
  });
});
