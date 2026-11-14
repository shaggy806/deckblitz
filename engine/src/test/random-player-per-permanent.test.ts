/**
 * "For each nonland permanent, choose a player at random. Then each player
 * gains control of each permanent for which they were chosen. Untap those
 * permanents." (Scrambleverse) — `gain-control-all` with `who: "random"`: a
 * player still in the game drawn for each permanent, its controller among
 * them, each token of a stack its own permanent; every draw made before
 * anything changes hands (the rulings), then each one untapped.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, cast, controller, lands, spawn, table, toHand } from "./harness.js";

const announced = (game: Game): number => game.events.filter((e) => e.type === "chosen-at-random").length;

function castScrambleverse(game: Game): void {
  lands(game, "Mountain", 8);
  cast(game, toHand(game, "Scrambleverse"));
}

describe("Scrambleverse", () => {
  it("draws a player for each nonland permanent, untaps every one, and leaves the lands", () => {
    const { game } = table({ players: 4 });
    const seats: readonly PlayerId[] = [A, B, C, D];
    const creatures: ObjectId[] = [];
    for (const seat of seats) for (let i = 0; i < 5; i += 1) creatures.push(spawn(game, "Grizzly Bears", seat, { tapped: true }));
    const forest = spawn(game, "Forest", B, { tapped: true });
    const before = announced(game);
    castScrambleverse(game);
    // One random choice for each of the twenty.
    expect(announced(game) - before).toBe(20);
    for (const id of creatures) {
      expect(game.state.objects[id].tapped).toBe(false);
      expect(seats).toContain(controller(game, id));
    }
    // Twenty draws over four players: more than one of them got something.
    expect(new Set(creatures.map((id) => controller(game, id))).size).toBeGreaterThan(1);
    expect(controller(game, forest)).toBe(B);
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("chooses for each token of a stack on its own", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "1/1 Thrull Token", count: 8 });
    const before = announced(game);
    castScrambleverse(game);
    expect(announced(game) - before).toBe(8);
    // Each player's share, counted token by token, adds up to the eight.
    const share = (p: PlayerId): number =>
      game.battlefield
        .map((id) => game.state.objects[id])
        .filter((o) => o.isToken && o.controller === p)
        .reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(share(A) + share(B)).toBe(8);
  });

  it("the same seed draws the same way", () => {
    const owners = (): PlayerId[] => {
      const { game } = table({ players: 3, seed: 7 });
      const ids = [A, B, C].flatMap((seat) => [spawn(game, "Grizzly Bears", seat), spawn(game, "Hill Giant", seat)]);
      castScrambleverse(game);
      return ids.map((id) => controller(game, id));
    };
    expect(owners()).toEqual(owners());
  });
});
