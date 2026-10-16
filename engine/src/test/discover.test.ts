/**
 * Discover N (rule 701.57a): exile cards from the top of your library until
 * you exile a nonland card with mana value N or less; you may cast it without
 * paying its mana cost if the resulting spell's mana value is N or less, and
 * if you don't, it goes to your hand. The rest go to the bottom in a random
 * order. You've discovered whatever was possible (701.57b) — "whenever you
 * discover" (Curator of Sun's Creation).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, cast, enter, hand, lands, quiet, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** Run on, answering every discover's offer with `accept`; the cards offered. */
function answerOffers(game: Game, accept: boolean): ObjectId[] {
  const offered: ObjectId[] = [];
  for (let i = 0; i < 500 && !quiet(game.state); i += 1) {
    const a = game.state.awaiting;
    if (a?.kind === "cast-now") {
      offered.push(...a.cards);
      game.dispatch({
        type: "cast-now",
        player: A,
        cast: accept ? { type: "cast-spell", player: A, card: a.cards[0], targets: [], via: "effect", free: true } : null,
      });
    } else if (a !== null) {
      throw new Error(`unexpected ${a.kind}`);
    } else {
      game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    }
  }
  return offered;
}

/** Destroy `id` without settling, so the offer waits for `answerOffers`. */
const kill = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: id }]);

/** Top of the library, first to last. */
function stack(game: Game, ...names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

describe("discover", () => {
  it("exiles to the first nonland card with mana value N or less; declined, it goes to hand, the rest to the bottom", () => {
    const { game } = table();
    const [forest, giant, bears] = stack(game, "Forest", "Hill Giant", "Grizzly Bears");
    const gnawer = spawn(game, "Primordial Gnawer");
    kill(game, gnawer);
    expect(answerOffers(game, false)).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2).sort()).toEqual([forest, giant].sort());
  });

  it("accepted, it's cast without paying its mana cost", () => {
    const { game } = table();
    const [, bears] = stack(game, "Hill Giant", "Grizzly Bears");
    const gnawer = spawn(game, "Primordial Gnawer");
    kill(game, gnawer);
    answerOffers(game, true);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("finds nothing in a library of lands, and puts them all back", () => {
    const { game } = table();
    const before = game.state.zones.perPlayer[A].library.length;
    const handBefore = hand(game).length;
    kill(game, spawn(game, "Primordial Gnawer"));
    expect(answerOffers(game, false)).toEqual([]);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(before);
    expect(hand(game)).toHaveLength(handBefore);
  });

  it("'if you cast it': Geological Appraiser put onto the battlefield doesn't discover", () => {
    const { game } = table();
    const [bears] = stack(game, "Grizzly Bears");
    enter(game, "Geological Appraiser");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
  });

  it("whenever you discover, discover again for the same value — once each turn", () => {
    const { game } = table();
    spawn(game, "Curator of Sun's Creation");
    lands(game, "Mountain", 4);
    const [first, , second, third] = stack(game, "Grizzly Bears", "Hill Giant", "Llanowar Elves", "Raging Goblin");
    cast(game, toHand(game, "Geological Appraiser"), { settle: false });
    expect(answerOffers(game, false)).toEqual([first, second]);
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
    // Once each turn: a second discover this turn isn't doubled.
    kill(game, spawn(game, "Primordial Gnawer"));
    expect(answerOffers(game, false)).toEqual([third]);
  });
});
