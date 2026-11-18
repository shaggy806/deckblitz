/**
 * "Counter target spell if its controller is poisoned" (Corrupted Resolve): a
 * `conditional` on `of-player { controllerOf: 0 }` over `player-counters`
 * (poison, at least one — its ruling), read as it resolves. A spell whose
 * controller isn't poisoned is still a legal target; it just stays.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, lands, ref, settle, table, toHand, zone } from "./harness.js";

/** Alice casts Grizzly Bears, then Corrupted Resolve at it, holding priority. */
function resolveAtBears(game: Game, poisoned: readonly PlayerId[]): string {
  for (const p of poisoned) game.state.players[p].counters.poison = 1;
  lands(game, "Forest", 2);
  lands(game, "Island", 2);
  const bears = toHand(game, "Grizzly Bears");
  cast(game, bears, { settle: false });
  cast(game, toHand(game, "Corrupted Resolve"), { targets: [ref(bears)], settle: false });
  settle(game);
  return zone(game, bears);
}

describe("Corrupted Resolve", () => {
  it("counters the spell when its controller is poisoned", () => {
    const { game } = table();
    expect(resolveAtBears(game, [A])).toBe("graveyard");
  });

  it("doesn't when its controller isn't — though another player is", () => {
    const { game } = table();
    expect(resolveAtBears(game, [B])).toBe("battlefield");
  });

  it("doesn't when nobody is poisoned", () => {
    const { game } = table();
    expect(resolveAtBears(game, [])).toBe("battlefield");
  });
});
