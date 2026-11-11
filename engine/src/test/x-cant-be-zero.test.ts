/**
 * "X can't be 0" on a spell's own {X} (`CardDefinition.minX`, rule 601.2b):
 * Mind Grind. The least X on offer is 1, and a cast that pays no {X} — where
 * the only legal X is 0 (rule 107.3b) — isn't a cast at all (its ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, C, cast, graveyard, lands, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const offer = (game: Game, card: string) => {
  for (const action of game.legalActions(A)) {
    if (action.kind === "cast-spell" && action.card === card) return action;
  }
  return undefined;
};

describe("Mind Grind", () => {
  it("is offered from X = 1, and refuses X = 0", () => {
    const { game } = table();
    lands(game, "Underground Sea", 5);
    const grind = toHand(game, "Mind Grind");
    expect(offer(game, grind)?.xCost).toMatchObject({ minX: 1, maxX: 3 });
    expect(() => cast(game, grind, { x: 0 })).toThrow(/X can't be 0/);
    expect(zone(game, grind)).toBe("hand");
  });

  it("isn't offered with only {U}{B} to pay", () => {
    const { game } = table();
    lands(game, "Underground Sea", 2);
    expect(offer(game, toHand(game, "Mind Grind"))).toBeUndefined();
  });

  it("can't be cast without paying its mana cost, but still can by paying", () => {
    const { game } = table();
    spawn(game, "Omniscience");
    const grind = toHand(game, "Mind Grind");
    // A free spell is on offer beside it, so the board does offer free casts.
    const bears = toHand(game, "Grizzly Bears");
    expect(offer(game, bears)).toBeDefined();
    expect(offer(game, grind)).toBeUndefined();
    lands(game, "Underground Sea", 3);
    expect(offer(game, grind)?.xCost).toMatchObject({ minX: 1, maxX: 1 });
  });

  it("cascaded into, it can't be cast: no offer, where another X spell gets one", () => {
    const cascadeInto = (name: string): { asked: number; where: string } => {
      const { game, a } = table();
      lands(game, "Taiga", 4);
      const card = toLibrary(game, name);
      let asked = 0;
      a.chooseCastNowFn = () => {
        asked += 1;
        return null;
      };
      cast(game, toHand(game, "Bloodbraid Elf"));
      return { asked, where: zone(game, card) };
    };
    expect(cascadeInto("Stream of Life")).toEqual({ asked: 1, where: "library" });
    expect(cascadeInto("Mind Grind")).toEqual({ asked: 0, where: "library" });
  });

  it("each opponent reveals until X lands, and all of it goes to the graveyard", () => {
    const { game } = table({ players: 3 });
    lands(game, "Underground Sea", 4);
    // Bob, top first: Bears, Forest, Elves, Island, then a Swamp that stays.
    const swamp = toLibrary(game, "Swamp", B);
    const bobs = [
      toLibrary(game, "Island", B),
      toLibrary(game, "Llanowar Elves", B),
      toLibrary(game, "Forest", B),
      toLibrary(game, "Grizzly Bears", B),
    ];
    // Carol: two lands on top.
    const kept = toLibrary(game, "Grizzly Bears", C);
    const carols = [toLibrary(game, "Plains", C), toLibrary(game, "Mountain", C)];
    const mine = toLibrary(game, "Island", A);
    cast(game, toHand(game, "Mind Grind"), { x: 2 });
    for (const id of bobs) expect(zone(game, id)).toBe("graveyard");
    expect(graveyard(game, B)).toHaveLength(4);
    expect(zone(game, swamp)).toBe("library");
    for (const id of carols) expect(zone(game, id)).toBe("graveyard");
    expect(graveyard(game, C)).toHaveLength(2);
    expect(zone(game, kept)).toBe("library");
    expect(zone(game, mine)).toBe("library");
  });
});
