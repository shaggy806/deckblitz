/**
 * Plotting from the top of the library (rule 702.170a, a special action,
 * 116.2k) — Fblthp, Lost on the Range: "The top card of your library has
 * plot. The plot cost is equal to its mana cost. You may plot nonland cards
 * from the top of your library." A card with plot of its own may use either
 * cost (the card's ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const plotCosts = (game: Game, card: ObjectId): readonly string[] =>
  game.legalActions(A).flatMap((a) => (a.kind === "plot" && a.card === card ? [a.cost] : []));

const plot = (game: Game, card: ObjectId, cost?: string): void => {
  const action = { type: "plot", player: A, card, ...(cost !== undefined ? { cost } : {}) } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
};

describe("plot from the top of the library (Fblthp, Lost on the Range)", () => {
  it("the top card is plotted for its mana cost, and cast free on a later turn", () => {
    const { game } = table();
    spawn(game, "Fblthp, Lost on the Range");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    expect(plotCosts(game, bears)).toEqual(["{1}{G}"]);
    plot(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].plottedOnTurn).toBe(game.state.turn.number);
    nextTurn(game);
    nextTurn(game);
    cast(game, bears, { via: "plot", free: true });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("only the top card, only a nonland, only with Fblthp, and at sorcery speed", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const under = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    expect(plotCosts(game, forest)).toEqual([]);
    const fblthp = spawn(game, "Fblthp, Lost on the Range");
    // A land on top has plot, but can't be plotted from there.
    expect(plotCosts(game, forest)).toEqual([]);
    expect(plotCosts(game, under)).toEqual([]);
    expect(game.canDispatch({ type: "plot", player: A, card: under })).not.toBeNull();
    const top = toLibrary(game, "Grizzly Bears");
    expect(plotCosts(game, top)).toEqual(["{1}{G}"]);
    // Without Fblthp, nothing.
    game.debugMove(fblthp, "graveyard");
    expect(plotCosts(game, top)).toEqual([]);
    // Not on an opponent's turn.
    spawn(game, "Fblthp, Lost on the Range");
    expect(plotCosts(game, top)).toEqual(["{1}{G}"]);
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A);
    expect(plotCosts(game, top)).toEqual([]);
  });

  it("a card with plot of its own may use either cost", () => {
    const { game } = table();
    spawn(game, "Fblthp, Lost on the Range");
    const sharpshooter = toLibrary(game, "Longhorn Sharpshooter");
    lands(game, "Mountain", 4);
    expect(plotCosts(game, sharpshooter)).toEqual(["{3}{R}", "{2}{R}"]);
    plot(game, sharpshooter, "{2}{R}");
    expect(zone(game, sharpshooter)).toBe("exile");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(3);
  });

  it("a hand card still plots as before, and a cost it doesn't have is refused", () => {
    const { game } = table();
    spawn(game, "Fblthp, Lost on the Range");
    const sharpshooter = toHand(game, "Longhorn Sharpshooter");
    lands(game, "Mountain", 4);
    expect(plotCosts(game, sharpshooter)).toEqual(["{3}{R}"]);
    expect(game.canDispatch({ type: "plot", player: A, card: sharpshooter, cost: "{2}{R}" })).not.toBeNull();
    plot(game, sharpshooter);
    expect(zone(game, sharpshooter)).toBe("exile");
  });

  it("the opponent's top card is not theirs to plot through your Fblthp", () => {
    const { game } = table();
    spawn(game, "Fblthp, Lost on the Range");
    const bobs = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    expect(plotCosts(game, bobs)).toEqual([]);
  });
});
