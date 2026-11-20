/**
 * A cost increase a spell prints on itself (`SelfCostReduction.increaseGeneric`,
 * rule 601.2f): Hurkyl's Final Meditation's "During turns other than yours,
 * this spell costs {3} more to cast" — {4}{U}{U}{U} on its caster's turn,
 * {7}{U}{U}{U} on anyone else's.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, hand, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Hurkyl's Final Meditation", () => {
  it("costs its printed cost on its caster's turn, returns every nonland permanent and ends the turn", () => {
    const { game } = table();
    const islands = lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Savannah Lions");
    const meditation = toHand(game, "Hurkyl's Final Meditation");
    expect(castable(game, meditation)).toBe(true);
    const turn = game.state.turn.number;
    cast(game, meditation, { settle: false });
    game.advanceUntil((s) => s.turn.number > turn || s.zones.shared.stack.length === 0);
    expect(hand(game, B)).toContain(bears);
    expect(hand(game)).toContain(mine);
    expect(zone(game, islands[0])).toBe("battlefield");
    // Ending the turn exiled it from the stack (rule 724.1b).
    expect(zone(game, meditation)).toBe("exile");
  });

  it("costs {3} more during another player's turn", () => {
    const { game } = table();
    lands(game, "Island", 7);
    lands(game, "Forest", 1, B);
    const growth = spawn(game, "Grizzly Bears", B);
    const meditation = toHand(game, "Hurkyl's Final Meditation");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    // Bob casts something so Alice has priority on his turn.
    const giant = toHand(game, "Giant Growth", B);
    cast(game, giant, { player: B, targets: [ref(growth)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(castable(game, meditation)).toBe(false);
    lands(game, "Island", 3);
    expect(castable(game, meditation)).toBe(true);
  });
});
