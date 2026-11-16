/**
 * "Each foretold card you own in exile" — the `foretold` filter clause (rule
 * 702.143c-d): a card in exile, face down, foretold. Alrund, God of the
 * Cosmos counts it beside the cards in its controller's hand; its end-step
 * trigger chooses a card type, then reveals the top two; and Hakka,
 * Whispering Raven, its back face, returns to hand after combat damage.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, attack, cast, hand, lands, life, pickModes, pt, settle, spawn, table, toExile, toHand, toLibrary, toStep, zone } from "./harness.js";

const handSize = (game: Game): number => hand(game, A).length;

describe("Alrund, God of the Cosmos — +1/+1 for each card in your hand and each foretold card you own in exile", () => {
  it("a card foretold from the hand still counts; a face-up exiled card doesn't", () => {
    const { game } = table();
    const alrund = spawn(game, "Alrund, God of the Cosmos");
    lands(game, "Island", 2);
    const behold = toHand(game, "Behold the Multiverse");
    const n = handSize(game);
    expect(pt(game, alrund)).toEqual({ power: 1 + n, toughness: 1 + n });
    game.dispatch({ type: "foretell", player: A, card: behold });
    expect(zone(game, behold)).toBe("exile");
    expect(game.state.objects[behold].foretold).toBe(true);
    // One fewer in hand, one foretold in exile.
    expect(handSize(game)).toBe(n - 1);
    expect(pt(game, alrund)).toEqual({ power: 1 + n, toughness: 1 + n });
    toExile(game, "Grizzly Bears");
    expect(pt(game, alrund)).toEqual({ power: 1 + n, toughness: 1 + n });
  });

  it("an opponent's foretold card isn't yours", () => {
    const { game } = table();
    const alrund = spawn(game, "Alrund, God of the Cosmos");
    lands(game, "Island", 2, B);
    const behold = toHand(game, "Behold the Multiverse", B);
    toStep(game, "precombat-main", B);
    game.dispatch({ type: "foretell", player: B, card: behold });
    expect(game.state.objects[behold].foretold).toBe(true);
    const n = handSize(game);
    expect(pt(game, alrund)).toEqual({ power: 1 + n, toughness: 1 + n });
  });
});

describe("Alrund — at the beginning of your end step, a card type, then the top two", () => {
  it("the cards of the chosen type to the hand, the rest to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Alrund, God of the Cosmos");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 2); // Creature
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(forest);
  });

  it("a card type no card in a library can have: both to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Alrund, God of the Cosmos");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 9);
    toStep(game, "end");
    settle(game);
    const library = game.state.zones.perPlayer[A].library;
    expect(new Set(library.slice(-2))).toEqual(new Set([forest, bears]));
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Hakka, Whispering Raven — combat damage to a player returns it, then scry 2", () => {
  it("back to its owner's hand, then scry 2", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const hakka = toHand(game, "Alrund, God of the Cosmos");
    cast(game, hakka, { face: 1 });
    expect(pt(game, hakka)).toEqual({ power: 2, toughness: 3 });
    toStep(game, "precombat-main", A);
    const top = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === top);
    attack(game, a, [hakka]);
    expect(game.state.turn.number).toBe(3);
    expect(life(game, B)).toBe(18);
    expect(zone(game, hakka)).toBe("hand");
    // Scried to the bottom.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(top);
  });
});
