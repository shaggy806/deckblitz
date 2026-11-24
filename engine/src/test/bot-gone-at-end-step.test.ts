/**
 * `goneAtEndStep`: the permanents this turn's end step takes whatever is done
 * with them — the per-object flags, a card's own "at the beginning of the end
 * step, sacrifice this", and a delayed sacrifice naming it. What the bots'
 * evaluation and swing-back arithmetic leave out.
 */

import { describe, expect, it } from "vitest";

import { goneAtEndStep } from "../bot/gone-at-end-step.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, nextTurn, pickFromZone, ref, registryOf, settle, spawn, table, toHand, zone } from "./harness.js";

const gone = (game: Game, id: ObjectId): boolean => goneAtEndStep(game.state, registryOf(game), game.state.objects[id]);

describe("goneAtEndStep", () => {
  it("a Lightning Rager is, by its own text, and an ordinary creature isn't", () => {
    const { game } = table();
    const rager = spawn(game, "Lightning Rager Token");
    const bears = spawn(game, "Grizzly Bears");
    expect(gone(game, rager)).toBe(true);
    expect(gone(game, bears)).toBe(false);
  });

  it("the creature Sneak Attack puts in is, by the delayed sacrifice, and it's sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const sneak = spawn(game, "Sneak Attack");
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    game.dispatch({ type: "activate-ability", player: A, source: sneak, abilityIndex: 0, targets: [] });
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(gone(game, giant)).toBe(true);
    nextTurn(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Ball Lightning is on any player's turn (every end step), and not once it has lost its abilities", () => {
    const { game } = table();
    const ball = spawn(game, "Ball Lightning", B);
    expect(gone(game, ball)).toBe(true);
    // Turn to Frog's effect.
    game.debugApplyEffect(A, { kind: "become", target: 0, loseAbilities: true, duration: "end-of-turn" }, [ref(ball)]);
    expect(gone(game, ball)).toBe(false);
  });
});
