/**
 * A search whose finds an opponent splits, "the rest" shuffled into the
 * library (`search-library`'s `destination: "library"` beside an `instead`):
 * Turtles Forever's "search your library and/or outside the game for exactly
 * four legendary creature cards you own with different names, then reveal
 * those cards. An opponent chooses two of them. Put the chosen cards into
 * your hand and shuffle the rest into your library" — a find from outside
 * the game (rule 701.23j, the sideboard, 400.11a) goes into the library too.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, hand, lands, pickFromZone, table, toHand, toLibrary, zone } from "./harness.js";

const outsideNamed = (game: Game, name: string): ObjectId => {
  const id = (game.state.outside?.[A] ?? []).find((o) => game.state.objects[o].cardName === name);
  if (id === undefined) throw new Error(`no ${name} outside the game`);
  return id;
};

describe("Turtles Forever", () => {
  it("the opponent's two go to the hand, the other two into the library — from outside the game too", () => {
    const { game, a, b } = table({ sideboard: ["Adeline, Resplendent Cathar", "Grizzly Bears"] });
    const thalia = toLibrary(game, "Thalia, Guardian of Thraben");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    const mikaeus = toLibrary(game, "Mikaeus, the Lunarch");
    toLibrary(game, "Hill Giant");
    const adeline = outsideNamed(game, "Adeline, Resplendent Cathar");
    const search = pickFromZone(a, thalia, isamaru, mikaeus, adeline);
    const split = pickFromZone(b, isamaru, adeline);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Turtles Forever"));
    // Legendary creature cards only, from the library and the sideboard.
    const offered = search.offered.map((id) => game.state.objects[id].cardName);
    expect(offered).toEqual(
      expect.arrayContaining(["Thalia, Guardian of Thraben", "Isamaru, Hound of Konda", "Adeline, Resplendent Cathar"]),
    );
    expect(offered).not.toContain("Hill Giant");
    expect(offered).not.toContain("Grizzly Bears");
    expect(split.offered).toHaveLength(4);
    expect(zone(game, isamaru)).toBe("hand");
    expect(zone(game, adeline)).toBe("hand");
    expect(zone(game, thalia)).toBe("library");
    expect(zone(game, mikaeus)).toBe("library");
    expect(hand(game)).toEqual(expect.arrayContaining([isamaru, adeline]));
  });

  it("a find from outside the game the opponent leaves is shuffled into the library", () => {
    const { game, a, b } = table({ sideboard: ["Adeline, Resplendent Cathar"] });
    const thalia = toLibrary(game, "Thalia, Guardian of Thraben");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    const adeline = outsideNamed(game, "Adeline, Resplendent Cathar");
    pickFromZone(a, thalia, isamaru, adeline);
    pickFromZone(b, thalia, isamaru);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Turtles Forever"));
    expect(zone(game, thalia)).toBe("hand");
    expect(zone(game, isamaru)).toBe("hand");
    expect(zone(game, adeline)).toBe("library");
    expect(game.state.zones.perPlayer[A].library).toContain(adeline);
    expect(game.state.outside?.[A] ?? []).not.toContain(adeline);
  });

  it("with two found, the opponent has both go to the hand", () => {
    const { game, a } = table();
    const thalia = toLibrary(game, "Thalia, Guardian of Thraben");
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda");
    pickFromZone(a, thalia, isamaru);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Turtles Forever"));
    expect(zone(game, thalia)).toBe("hand");
    expect(zone(game, isamaru)).toBe("hand");
  });
});
