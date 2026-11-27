/**
 * The `player-with-turn-stat` target: "target player who lost life this
 * turn" (Rix Maadi Guildmage) — a player whose turn total is above 0, as the
 * target is chosen and as it resolves (rule 608.2b).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, ref, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const drain = (game: Game, guildmage: ObjectId, who: PlayerId): string | null =>
  game.canDispatch({ type: "activate-ability", player: A, source: guildmage, abilityIndex: 1, targets: [ref(who)] });

describe("Rix Maadi Guildmage", () => {
  it("only a player who lost life this turn can be targeted", () => {
    const { game } = table();
    const guildmage = spawn(game, "Rix Maadi Guildmage");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    expect(drain(game, guildmage, B)).not.toBeNull();
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(drain(game, guildmage, B)).toBeNull();
    // Alice lost none.
    expect(drain(game, guildmage, A)).not.toBeNull();
    activate(game, guildmage, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("the next turn, last turn's loss no longer counts", () => {
    const { game } = table();
    const guildmage = spawn(game, "Rix Maadi Guildmage");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    expect(drain(game, guildmage, B)).toBeNull();
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A);
    expect(drain(game, guildmage, B)).not.toBeNull();
  });
});
