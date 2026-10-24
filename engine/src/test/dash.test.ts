/**
 * Dash (rule 702.109a): an alternative cost from the hand (or a commander
 * from the command zone); a permanent cast that way has haste for as long as
 * it stays this permanent, and returns to its owner's hand at the beginning
 * of the next end step — unless it has left the battlefield by then (the
 * rulings). Screamreach Brawler, Ragavan, Nimble Pilferer.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, attack, cast, destroy, hand, keywords, lands, quiet, table, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

/** Bob's upkeep: alice's end step has passed. */
const bobsUpkeep = (s: GameState): boolean => s.turn.number === 2 && s.turn.step === "upkeep";

const dashOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "dash");

describe("dash", () => {
  it("casts Screamreach Brawler for {1}{R}: haste now, back in its owner's hand at the next end step", () => {
    const { game } = table();
    const brawler = toHand(game, "Screamreach Brawler");
    lands(game, "Mountain", 2);
    expect(dashOffers(game, brawler)).toHaveLength(1);
    cast(game, brawler, { via: "dash" });
    expect(zone(game, brawler)).toBe("battlefield");
    expect(keywords(game, brawler).has("haste")).toBe(true);
    game.advanceUntil(bobsUpkeep);
    expect(hand(game)).toContain(brawler);
  });

  it("isn't offered without the mana, and a normal cast has no haste and stays", () => {
    const { game } = table();
    const brawler = toHand(game, "Screamreach Brawler");
    lands(game, "Mountain", 1);
    expect(dashOffers(game, brawler)).toHaveLength(0);
    lands(game, "Mountain", 2);
    cast(game, brawler);
    expect(keywords(game, brawler).has("haste")).toBe(false);
    game.advanceUntil(bobsUpkeep);
    expect(zone(game, brawler)).toBe("battlefield");
  });

  it("stays in the graveyard when it died before the end step", () => {
    const { game } = table();
    const brawler = toHand(game, "Screamreach Brawler");
    lands(game, "Mountain", 2);
    cast(game, brawler, { via: "dash" });
    destroy(game, brawler);
    game.advanceUntil(bobsUpkeep);
    expect(zone(game, brawler)).toBe("graveyard");
  });

  it("can be dashed from the command zone, commander tax added", () => {
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      rules: { maxLandsPerTurn: 99, skipFirstDraw: false, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [A, B].map((player) => ({
        player,
        cards: Array<string>(40).fill("Wastes"),
        ...(player === A ? { commanders: ["Ragavan, Nimble Pilferer"] } : {}),
      })),
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
    const ragavan = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === "Ragavan, Nimble Pilferer")!;
    lands(game, "Mountain", 2);
    expect(dashOffers(game, ragavan)).toHaveLength(1);
    // Cast once before: {2} tax on top of {1}{R}.
    game.state.players[A].commanderCastCounts["Ragavan, Nimble Pilferer"] = 1;
    expect(dashOffers(game, ragavan)).toHaveLength(0);
    lands(game, "Mountain", 2);
    game.dispatch({ type: "cast-spell", player: A, card: ragavan, targets: [], via: "dash" });
    game.advanceUntil(quiet);
    expect(game.state.objects[ragavan].zone).toBe("battlefield");
    expect(keywords(game, ragavan).has("haste")).toBe(true);
  });
});

describe("Ragavan, Nimble Pilferer", () => {
  it("dashed in and connecting: a Treasure, and the top of that player's library castable this turn", () => {
    const { game, a } = table();
    const ragavan = toHand(game, "Ragavan, Nimble Pilferer");
    lands(game, "Mountain", 2);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    cast(game, ragavan, { via: "dash" });
    attack(game, a, [ragavan]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bolt)).toBe(true);
    game.advanceUntil(bobsUpkeep);
    expect(hand(game)).toContain(ragavan);
  });
});
