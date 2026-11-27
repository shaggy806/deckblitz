/**
 * Bound // Determined. Bound: "Sacrifice a creature. Return up to X cards from
 * your graveyard to your hand, where X is the number of colors that creature
 * was. Exile this card." (`colorsOf` the sacrificed creature as it last
 * existed). Determined: "Other spells you control can't be countered this
 * turn. Draw a card." (`grant-spells-this-turn` `cantBeCountered`: the spells
 * already on the stack and those cast later — the rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const give = (game: Game, player: PlayerId): void => {
  for (let i = 0; i < 8 && game.state.priority.holder !== player; i++) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder as PlayerId });
  }
  expect(game.state.priority.holder).toBe(player);
};

function castHalf(game: Game, card: ObjectId, face: 1 | 2): void {
  cast(game, card, { face, settle: false });
}

describe("Bound", () => {
  it("returns up to as many cards as the sacrificed creature had colors, then exiles itself [Bound]", () => {
    const { game, a } = table();
    // Watchwolf is green and white: two cards, itself among them.
    const wolf = spawn(game, "Watchwolf", A);
    const g1 = toGraveyard(game, "Grizzly Bears", A);
    const g2 = toGraveyard(game, "Hill Giant", A);
    const g3 = toGraveyard(game, "Lightning Bolt", A);
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    const card = toHand(game, "Bound // Determined");
    const seen = pickFromZone(a, g1, wolf);
    castHalf(game, card, 1);
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([g1, g2, g3, wolf]));
    expect(zone(game, wolf)).toBe("hand");
    expect(zone(game, g1)).toBe("hand");
    expect(zone(game, g2)).toBe("graveyard");
    expect(zone(game, g3)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });

  it("a colorless creature returns nothing [Bound]", () => {
    const { game } = table();
    spawn(game, "Ornithopter", A);
    const g1 = toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    const card = toHand(game, "Bound // Determined");
    castHalf(game, card, 1);
    settle(game);
    expect(zone(game, g1)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Determined", () => {
  it("saves a spell already aimed at, and spells cast later, and draws [Determined]", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 2, B);
    const answer = toHand(game, "Counterspell", B);
    give(game, B);
    cast(game, answer, { player: B, targets: [ref(bears)], settle: false });
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const card = toHand(game, "Bound // Determined");
    const before = hand(game).length;
    give(game, A);
    castHalf(game, card, 2);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, answer)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before); // Determined left, one drawn
  });
});
