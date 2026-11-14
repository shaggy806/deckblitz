import { describe, expect, it } from "vitest";
import { suggestedCardNames } from "../card-names.js";
import { A, B, attack, controller, pickFromZone, pickModes, registryOf, spawn, table, toLibrary, zone } from "./harness.js";

// "Search that player's library for a card, then that player chooses a card
// name" (Sphinx Ambassador): the find stays in the library, unrevealed (rule
// 701.23e); the damaged player names a card, and the effect stays its
// controller's, who may then put a creature card without that name onto the
// battlefield under their control; then that player shuffles.

function sphinxHits(found: string, named: string, take = true) {
  const t = table();
  const { game, a, b } = t;
  const sphinx = spawn(game, "Sphinx Ambassador");
  const card = toLibrary(game, found, B);
  toLibrary(game, "Llanowar Elves", B);
  pickFromZone(a, card);
  let asked: string | undefined;
  let bobSaw: unknown = "not asked";
  b.chooseCardNameFn = () => {
    asked = "bob";
    bobSaw = game.viewFor(B).objects[card];
    return named;
  };
  a.chooseCardNameFn = () => {
    asked = "alice";
    return named;
  };
  if (take) pickModes(a, 0);
  else pickModes(a);
  attack(game, a, [sphinx]);
  return { ...t, card, asked: () => asked, bobSaw: () => bobSaw };
}

describe("a player names a card after a hidden search", () => {
  it("Sphinx Ambassador: the damaged player names; a creature without that name may be taken", () => {
    const { game, card, asked } = sphinxHits("Grizzly Bears", "Llanowar Elves");
    expect(asked()).toBe("bob");
    expect(zone(game, card)).toBe("battlefield");
    expect(controller(game, card)).toBe(A);
    expect(game.state.objects[card].owner).toBe(B);
    // The shuffle owed by the search was paid, last.
    expect(game.state.searchShufflesOwed ?? []).toEqual([]);
  });

  it("Sphinx Ambassador: naming the found card keeps it in the library", () => {
    const { game, card } = sphinxHits("Grizzly Bears", "Grizzly Bears");
    expect(zone(game, card)).toBe("library");
  });

  it("Sphinx Ambassador: a noncreature find stays, whatever is named", () => {
    const { game, card } = sphinxHits("Lightning Bolt", "Grizzly Bears");
    expect(zone(game, card)).toBe("library");
  });

  it("Sphinx Ambassador: the take is a may", () => {
    const { game, card } = sphinxHits("Grizzly Bears", "Llanowar Elves", false);
    expect(zone(game, card)).toBe("library");
  });

  it("Sphinx Ambassador: the namer can't see the find while naming", () => {
    const { bobSaw } = sphinxHits("Grizzly Bears", "Llanowar Elves");
    expect(bobSaw()).toBeUndefined();
  });

  it("the own-library-creatures aim suggests the chooser's dearest creature cards first", () => {
    const { game } = table();
    toLibrary(game, "Llanowar Elves", B);
    toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Sphinx Ambassador", B);
    const names = suggestedCardNames(game.state, registryOf(game), B, "own-library-creatures", undefined);
    expect(names.slice(0, 2)).toEqual(["Sphinx Ambassador", "Llanowar Elves"]);
    expect(names).not.toContain("Lightning Bolt");
  });
});
