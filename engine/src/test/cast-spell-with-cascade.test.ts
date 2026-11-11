/**
 * "Whenever you cast a spell with cascade" (`cast-spell`'s `spellHas:
 * "cascade"`, rule 702.85a) — Aurora Phoenix, from the graveyard: a printed
 * cascade, one a static grants the spell, never a spell without it, and the
 * Phoenix's own cast only when another copy is the one in the graveyard.
 */
import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

/** Alice's first main phase, `library` on top of her deck, `lands` untapped. */
const setUp = (library: readonly string[], lands: readonly string[]): Game => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: A,
    rules: { maxLandsPerTurn: 99, skipFirstDraw: false, maxHandSize: 99 },
    decks: [
      { player: A, cards: [...Array(8).fill("Wastes"), ...library, ...Array(40).fill("Wastes")] },
      { player: B, cards: Array(40).fill("Forest") },
    ],
  });
  game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
  for (const land of lands) game.debugSpawn(land, A, "battlefield");
  return game;
};

/** Cast `name` from alice's hand and resolve everything, declining cascade's free cast. */
const castAndSettle = (game: Game, name: string): ObjectId => {
  const card = game.debugSpawn(name, A, "hand");
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
  for (let i = 0; i < 200 && !quiet(game.state); i += 1) {
    if (game.state.awaiting?.kind === "cast-now") {
      game.dispatch({ type: "cast-now", player: game.state.awaiting.player, cast: null });
    } else if (game.state.awaiting?.kind === "order-triggers") {
      const awaiting = game.state.awaiting;
      game.dispatch({ type: "order-triggers", player: awaiting.player, order: awaiting.triggers.map((_, i) => i) });
    } else if (game.state.awaiting !== null) {
      throw new Error(`unexpected ${game.state.awaiting.kind}`);
    } else {
      game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    }
  }
  return card;
};

const zone = (game: Game, id: ObjectId): string => game.state.objects[id].zone;

describe("Aurora Phoenix", () => {
  it("returns from the graveyard when you cast a spell with cascade printed on it", () => {
    const game = setUp(["Grizzly Bears"], ["Mountain", "Forest", "Forest", "Forest"]);
    const phoenix = game.debugSpawn("Aurora Phoenix", A, "graveyard");
    castAndSettle(game, "Bloodbraid Elf");
    expect(zone(game, phoenix)).toBe("hand");
  });

  it("stays put for a spell without cascade", () => {
    const game = setUp(["Grizzly Bears"], ["Wastes"]);
    const phoenix = game.debugSpawn("Aurora Phoenix", A, "graveyard");
    castAndSettle(game, "Sol Ring");
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("counts cascade a static gives the spell, and only the spells it gives it to", () => {
    const game = setUp(["Wastes"], ["Wastes", "Wastes"]);
    game.debugSpawn("The First Sliver", A, "battlefield");
    const phoenix = game.debugSpawn("Aurora Phoenix", A, "graveyard");
    castAndSettle(game, "Sol Ring");
    expect(zone(game, phoenix)).toBe("graveyard");
    castAndSettle(game, "Metallic Sliver");
    expect(zone(game, phoenix)).toBe("hand");
  });

  it("doesn't trigger from the hand, the battlefield or an opponent's graveyard", () => {
    const game = setUp(["Grizzly Bears"], ["Mountain", "Forest", "Forest", "Forest"]);
    const held = game.debugSpawn("Aurora Phoenix", A, "hand");
    const out = game.debugSpawn("Aurora Phoenix", A, "battlefield");
    const theirs = game.debugSpawn("Aurora Phoenix", B, "graveyard");
    const before = game.eventsOfType("ability-triggered").length;
    castAndSettle(game, "Bloodbraid Elf");
    expect([zone(game, held), zone(game, out), zone(game, theirs)]).toEqual(["hand", "battlefield", "graveyard"]);
    // Only the Elf's own cascade triggered.
    expect(game.eventsOfType("ability-triggered").length - before).toBe(1);
  });

  it("cast itself, it brings back another Phoenix in the graveyard and resolves", () => {
    const game = setUp(["Grizzly Bears"], Array<string>(6).fill("Mountain"));
    const buried = game.debugSpawn("Aurora Phoenix", A, "graveyard");
    const cast = castAndSettle(game, "Aurora Phoenix");
    expect(zone(game, buried)).toBe("hand");
    expect(zone(game, cast)).toBe("battlefield");
  });
});
