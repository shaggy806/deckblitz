/**
 * "The number of Curses attached to that player" — `CardFilter.attachedToPlayerRef`,
 * bound to the player a `PlayerRef` names as the effect applies (rule 303.4):
 * Curse of Thirst's damage and Curse of Surveillance's draws, both counted as
 * the ability resolves (Curse of Thirst's ruling), for the player whose
 * upkeep it is (`"trigger-player"`).
 */

import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, lands, life, ref, settle, table, toHand, toStep, watchTargets } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const curse = (game: Game, name: string, at: PlayerId = B): void => {
  lands(game, "Swamp", 5);
  lands(game, "Island", 5);
  cast(game, toHand(game, name), { targets: [ref(at)] });
};

describe("Curses attached to a player", () => {
  it("Curse of Thirst deals damage equal to the Curses attached to the enchanted player, not another's", () => {
    const { game } = table({ players: 3 });
    curse(game, "Curse of Thirst");
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(19);
    // A second Curse on bob, and one on carol, which doesn't count for him.
    toStep(game, "precombat-main", A);
    curse(game, "Curse of the Bloody Tome");
    curse(game, "Curse of the Bloody Tome", C);
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("Curse of Surveillance: any number of other players draw the Curses attached to the enchanted player", () => {
    const { game, a } = table({ players: 3 });
    curse(game, "Curse of Surveillance");
    curse(game, "Curse of the Bloody Tome");
    const seen = watchTargets(a, (offered) => [offered[0]?.includes(A) ? A : null, offered[0]?.includes(C) ? C : null]);
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    toStep(game, "upkeep", B);
    settle(game);
    // "Other than that player": the enchanted player isn't offered.
    expect(seen.offered[0]).toEqual(expect.arrayContaining([A, C]));
    expect(seen.offered[0]).not.toContain(B);
    expect(hand(game, A).length).toBe(before.a + 2);
    expect(hand(game, C).length).toBe(before.c + 2);
    expect(hand(game, B).length).toBe(before.b);
  });
});
