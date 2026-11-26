/**
 * "Target player shuffles their library" (rule 701.24): `shuffle-library`
 * with a player target — Soldier of Fortune ({R}, {T}) and Boggart Forager
 * ({R}, sacrifice it).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, enter, lands, ref, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const shuffled = (game: Game): readonly PlayerId[] =>
  game.state.eventLog.flatMap((e) => (e.type === "library-shuffled" ? [e.player] : []));

describe("target player shuffles their library", () => {
  it("Soldier of Fortune shuffles the target opponent's library, not its controller's", () => {
    const { game } = table();
    const soldier = enter(game, "Soldier of Fortune");
    lands(game, "Mountain", 1);
    const before = shuffled(game).length;
    activate(game, soldier, 0, { targets: [ref(B)] });
    expect(shuffled(game).slice(before)).toEqual([B]);
    expect(game.state.objects[soldier].tapped).toBe(true);
  });

  it("Soldier of Fortune can shuffle its controller's own library", () => {
    const { game } = table();
    const soldier = enter(game, "Soldier of Fortune");
    lands(game, "Mountain", 1);
    const before = shuffled(game).length;
    activate(game, soldier, 0, { targets: [ref(A)] });
    expect(shuffled(game).slice(before)).toEqual([A]);
  });

  it("Boggart Forager is sacrificed to shuffle the target player's library", () => {
    const { game } = table();
    const forager = enter(game, "Boggart Forager");
    lands(game, "Mountain", 1);
    const before = shuffled(game).length;
    activate(game, forager, 0, { targets: [ref(B)] });
    expect(zone(game, forager)).toBe("graveyard");
    expect(shuffled(game).slice(before)).toEqual([B]);
  });
});
