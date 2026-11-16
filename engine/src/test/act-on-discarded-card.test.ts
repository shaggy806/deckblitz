/**
 * Acting on "the discarded card" of a resolution's own discard: the
 * `{ thisWay: "discarded" }` reference, while that card is still where it was
 * put (`inZone`), then "if you do" on what was exiled this way. Leonardo da
 * Vinci: "Draw a card, then discard a card. If the discarded card was an
 * artifact card, exile it from your graveyard. If you do, create a token
 * that's a copy of it, except it's a 0/2 Thopter artifact creature with flying
 * in addition to its other types." — and his Thopters' base X/X, X fixed as
 * the ability resolves.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, hand, keywords, lands, pt, spawn, subtypes, table, types, zone } from "./harness.js";

const tokensNamed = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].cardName === name);

describe("Leonardo da Vinci", () => {
  it("exiles a discarded artifact card and makes a 0/2 flying Thopter artifact creature copy of it", () => {
    const { game, a } = table();
    const leo = spawn(game, "Leonardo da Vinci");
    lands(game, "Island", 3);
    const ring = game.debugSpawn("Sol Ring", A, "hand");
    a.chooseDiscardsFn = () => [ring];
    activate(game, leo, 1);
    expect(zone(game, ring)).toBe("exile");
    const [token] = tokensNamed(game, "Sol Ring");
    expect(token).toBeDefined();
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, token)).toContain("Thopter");
    expect(pt(game, token)).toEqual({ power: 0, toughness: 2 });
    expect(keywords(game, token).has("flying")).toBe(true);
  });

  it("leaves a discarded nonartifact card in the graveyard, and makes nothing", () => {
    const { game, a } = table();
    const leo = spawn(game, "Leonardo da Vinci");
    lands(game, "Island", 3);
    const bears = game.debugSpawn("Grizzly Bears", A, "hand");
    a.chooseDiscardsFn = () => [bears];
    const before = game.battlefield.length;
    activate(game, leo, 1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Grizzly Bears")).toHaveLength(0);
    expect(game.battlefield.length).toBe(before);
  });

  it("gives Thopters you control base power and toughness equal to the cards in hand, fixed as it resolves", () => {
    const { game } = table();
    const leo = spawn(game, "Leonardo da Vinci");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const x = hand(game).length;
    activate(game, leo, 0);
    expect(pt(game, thopter)).toEqual({ power: x, toughness: x });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    game.debugSpawn("Island", A, "hand");
    expect(pt(game, thopter)).toEqual({ power: x, toughness: x });
  });
});
