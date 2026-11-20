/**
 * "If you would get one or more poison counters, instead you get one poison counter and you
 * can't get additional poison counters this turn" (Melira, the Living Cure): a `would-add-counter`
 * replacement on a player with `modify: { set: 1 }` and an `also` prohibition, ordered among the
 * others the way best for the player getting them (rule 616.1).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { PlayerId } from "../primitives.js";
import { A, B, activate, destroy, named, nextTurn, ref, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";

const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters.poison ?? 0;
const givePoison = (amount: number): EffectSpec => ({ kind: "add-player-counters", counter: "poison", amount, who: "each-opponent" });

describe("Melira, the Living Cure", () => {
  it("three poison counters become one, and no more come this turn", () => {
    const { game } = table();
    spawn(game, "Melira, the Living Cure", A);
    game.debugApplyEffect(B, givePoison(3));
    expect(poison(game, A)).toBe(1);
    game.debugApplyEffect(B, givePoison(2));
    expect(poison(game, A)).toBe(1);
  });

  it("the cap lasts the turn only", () => {
    const { game } = table();
    spawn(game, "Melira, the Living Cure", A);
    game.debugApplyEffect(B, givePoison(3));
    nextTurn(game);
    game.debugApplyEffect(B, givePoison(4));
    expect(poison(game, A)).toBe(2);
  });

  it("an opponent's poison isn't capped", () => {
    const { game } = table();
    spawn(game, "Melira, the Living Cure", A);
    game.debugApplyEffect(A, givePoison(3));
    expect(poison(game, B)).toBe(3);
  });

  it("with Vorinclex halving, Melira first then the halving leaves none (the player's order)", () => {
    const { game } = table();
    spawn(game, "Melira, the Living Cure", A);
    spawn(game, "Vorinclex, Monstrous Raider", A);
    game.debugApplyEffect(B, givePoison(3));
    expect(poison(game, A)).toBe(0);
    // Melira applied, so nothing more this turn (the ruling).
    game.debugApplyEffect(B, givePoison(4));
    expect(poison(game, A)).toBe(0);
  });

  it("exiled, she returns another creature that goes to a graveyard this turn", () => {
    const { game } = table();
    const melira = spawn(game, "Melira, the Living Cure", A);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, melira, 0, { targets: [ref(bears)] });
    expect(zone(game, melira)).toBe("exile");
    destroy(game, bears);
    const back = named(game, "Grizzly Bears", B);
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
    expect(game.state.objects[back[0]].controller).toBe(B);
  });
});
