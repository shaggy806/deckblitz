/**
 * "Discard the last card you drew this turn" (Jandor's Ring): a discard cost
 * of one card matching `CardFilter.lastDrawnThisTurn` — the activator's
 * latest draw this turn (the journal's `card-drawn`), still in their hand.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, hand, lands, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

const offered = (game: Game, ring: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === ring);

const draw = (game: Game, player = A): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: 1 }, []);
};

describe("Jandor's Ring", () => {
  it("can't be activated before a card is drawn this turn", () => {
    const { game } = table();
    // Bob's upkeep: his opening hand and last turn's draws aren't this turn's.
    const ring = spawn(game, "Jandor's Ring", B);
    lands(game, "Island", 2, B);
    toStep(game, "upkeep", B);
    expect(hand(game, B).length).toBeGreaterThan(0);
    expect(offered(game, ring, B)).toBe(false);
    // His draw step's draw is.
    toStep(game, "draw", B);
    expect(offered(game, ring, B)).toBe(true);
  });

  it("discards the last card drawn to draw a card", () => {
    const { game, a } = table();
    const ring = spawn(game, "Jandor's Ring");
    lands(game, "Island", 2);
    const giant = toHand(game, "Hill Giant");
    const next = toLibrary(game, "Shock");
    const drawn = toLibrary(game, "Grizzly Bears");
    draw(game);
    expect(zone(game, drawn)).toBe("hand");
    expect(offered(game, ring)).toBe(true);
    let eligible: readonly ObjectId[] = [];
    a.chooseDiscardsFn = (cards, count) => {
      eligible = cards.map((c) => c.id);
      return eligible.slice(0, count);
    };
    activate(game, ring);
    // Only the drawn card was there to discard; the Hill Giant stays.
    if (eligible.length > 0) expect(eligible).toEqual([drawn]);
    expect(zone(game, drawn)).toBe("graveyard");
    expect(zone(game, next)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(game.state.objects[ring].tapped).toBe(true);
  });

  it("only the latest draw: once it has left the hand, an earlier one doesn't pay", () => {
    const { game } = table();
    const ring = spawn(game, "Jandor's Ring");
    lands(game, "Island", 2);
    const land = toLibrary(game, "Forest");
    const first = toLibrary(game, "Grizzly Bears");
    draw(game);
    draw(game);
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, land)).toBe("hand");
    expect(offered(game, ring)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: land });
    expect(zone(game, land)).toBe("battlefield");
    expect(offered(game, ring)).toBe(false);
  });

  it("an opponent's draw isn't the activator's", () => {
    const { game } = table();
    const ring = spawn(game, "Jandor's Ring");
    lands(game, "Island", 2);
    toLibrary(game, "Grizzly Bears");
    draw(game);
    toLibrary(game, "Grizzly Bears", B);
    draw(game, B);
    expect(offered(game, ring)).toBe(true);
  });
});
