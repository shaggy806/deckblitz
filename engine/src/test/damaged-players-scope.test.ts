import { describe, expect, it } from "vitest";

import { A, B, C, D, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/**
 * "Whenever one or more Pirates you control deal damage to your opponents,
 * exile the top card of **each of those opponents'** libraries" (Breeches,
 * Brazen Plunderer): a `deals-damage-batch` trigger fired once for the whole
 * damage event (`once: "per-event"`, rule 603.2c) carries the players its
 * sources dealt damage to, read by the `"damaged-players"` scope.
 */

const exiledFrom = (game: Game, player: PlayerId): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "exile" && o.owner === player)
    .map((o) => o.id);

describe("Breeches, Brazen Plunderer", () => {
  it("exiles the top card of each opponent its Pirates damaged, once, and lets you play them this turn", () => {
    const { game, a } = table({ players: 4 });
    const breeches = spawn(game, "Breeches, Brazen Plunderer");
    const hoarder = spawn(game, "Dire Fleet Hoarder");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: breeches, defender: B },
      { attacker: hoarder, defender: C },
      // Not a Pirate: Dave is dealt damage, but not by a Pirate.
      { attacker: bears, defender: D },
    ];
    toStep(game, "postcombat-main");
    const [fromBob] = exiledFrom(game, B);
    expect(exiledFrom(game, B)).toHaveLength(1);
    expect(exiledFrom(game, C)).toHaveLength(1);
    expect(exiledFrom(game, D)).toHaveLength(0);
    expect(exiledFrom(game, A)).toHaveLength(0);
    // The top card of Bob's library (a Wastes) is playable this turn.
    const plays = game.legalActions(A).filter((l) => l.kind === "play-land" && l.card === fromBob);
    expect(plays).toHaveLength(1);
  });

  it("isn't fired by a creature that isn't a Pirate", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Breeches, Brazen Plunderer");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(exiledFrom(game, B)).toHaveLength(0);
  });

  it("names nobody outside such a trigger", () => {
    const { game } = table({ players: 3 });
    game.debugApplyEffect(A, {
      kind: "impulse-exile",
      amount: 1,
      whose: "damaged-players",
      duration: "end-of-turn",
      play: true,
    });
    expect([B, C].map((p) => exiledFrom(game, p).length)).toEqual([0, 0]);
  });
});
