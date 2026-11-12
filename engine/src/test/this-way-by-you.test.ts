/**
 * `thisWayBy: "you"` — `thisWay` / `notThisWay` narrowed to what you did this
 * way. Rise of the Witch-king's "another permanent card" bars only the card
 * you sacrificed (its ruling): a card you own that an opponent controlled
 * and sacrificed may come back.
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("thisWayBy — Rise of the Witch-king", () => {
  it("offers the card an opponent sacrificed, never the one you did", () => {
    const { game, a } = table();
    lands(game, "Bayou", 4);
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    settle(game);
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [0];
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Rise of the Witch-king"));
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(zone(game, bears)).toBe("battlefield");
  });
});
