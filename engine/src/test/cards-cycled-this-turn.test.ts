/**
 * The journal word `"cycled"` (a turn-history view over the journal's
 * `cycled` entries, rule 702.29a): Spellpyre Phoenix's "at the beginning of
 * each end step, if you cycled two or more cards this turn, return this card
 * from your graveyard to your hand" — an intervening if (rule 603.4) of a
 * `fromGraveyard` ability (113.6k) — and its enters trigger's "target instant
 * or sorcery card with a cycling ability".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, nextTurn, pickModes, settle, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

const PHOENIX = "Spellpyre Phoenix";

function cycle(game: Game, card: ObjectId): void {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
}

describe("Spellpyre Phoenix", () => {
  it("two cards cycled this turn: it returns to hand at the end step", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Island", 2);
    cycle(game, toHand(game, "Lonely Sandbar"));
    cycle(game, toHand(game, "Censor"));
    toStep(game, "end");
    settle(game);
    expect(zone(game, phoenix)).toBe("hand");
  });

  it("one card cycled: it stays", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Island", 2);
    cycle(game, toHand(game, "Lonely Sandbar"));
    toStep(game, "end");
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("a cycle on an earlier turn doesn't count", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Island", 2);
    cycle(game, toHand(game, "Lonely Sandbar"));
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(A);
    cycle(game, toHand(game, "Censor"));
    toStep(game, "end");
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("enters: may return an instant or sorcery card with cycling, not one without", () => {
    const { game, a } = table();
    const censor = toGraveyard(game, "Censor");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickModes(a, 0);
    game.debugSpawn(PHOENIX, A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(zone(game, censor)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
