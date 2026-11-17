/**
 * "A player you're attacking" (`of-player`'s `"an-attacked-player"`): a
 * player a creature you control is attacking now — the player, not their
 * planeswalker (rules 506.3, 508.3a). Undercellar Sweep's "whenever you
 * attack, if you or a player you're attacking has the initiative, you create
 * two 1/1 white Soldier creature tokens that are tapped and attacking".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, attack, enter, named, spawn, table, tokensNamed } from "./harness.js";

const soldiers = (game: Game): number => tokensNamed(game, "Soldier Token", A);

function attackWith(initiative: PlayerId | undefined, defender: PlayerId): Game {
  const { game, a } = table({ players: 3 });
  spawn(game, "Undercellar Sweep");
  const bears = spawn(game, "Grizzly Bears");
  if (initiative !== undefined) game.state.initiative = initiative;
  attack(game, a, [bears], defender);
  return game;
}

describe("Undercellar Sweep", () => {
  it("makes two Soldiers while you have the initiative", () => {
    expect(soldiers(attackWith(A, B))).toBe(2);
  });

  it("makes two Soldiers when the player you're attacking has it", () => {
    expect(soldiers(attackWith(B, B))).toBe(2);
  });

  it("makes none when only a player you aren't attacking has it", () => {
    expect(soldiers(attackWith(C, B))).toBe(0);
  });

  it("makes none while nobody has the initiative", () => {
    expect(soldiers(attackWith(undefined, B))).toBe(0);
  });

  it("takes the initiative as it enters, and its tokens enter tapped and attacking", () => {
    const { game, a } = table();
    enter(game, "Undercellar Sweep");
    expect(game.state.initiative).toBe(A);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(soldiers(game)).toBe(2);
    for (const id of named(game, "Soldier Token", A)) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(game.state.objects[id].attacking).toBe(B);
    }
  });
});
