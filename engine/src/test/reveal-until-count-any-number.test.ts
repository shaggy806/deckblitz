/**
 * "Reveal cards from the top of your library until you reveal X permanent
 * cards … Put any number of those permanent cards onto the battlefield, then
 * put the rest of the revealed cards on the bottom of your library in a
 * random order." — Aurora Awakener: `reveal-until-count`'s `anyNumber`, the
 * controller choosing which found cards enter, the others going with the
 * rest. Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, enter, pickFromZone, spawn, table, toLibrary, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** Bears on top, then Shock, then Elves, over a library of Lightning Bolts. */
function stack(game: Game): { bears: ObjectId; shock: ObjectId; elves: ObjectId } {
  const elves = toLibrary(game, "Llanowar Elves");
  const shock = toLibrary(game, "Shock");
  const bears = toLibrary(game, "Grizzly Bears");
  return { bears, shock, elves };
}

describe("Aurora Awakener", () => {
  it("with two colors, two permanent cards are found; the one chosen enters, the rest go to the bottom", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    spawn(game, "Raging Goblin");
    const { bears, shock, elves } = stack(game);
    const seen = pickFromZone(a, elves);
    enter(game, "Aurora Awakener");
    expect([...seen.offered].sort()).toEqual([bears, elves].sort());
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, bears)).toBe("library");
    expect([...library(game).slice(-2)].sort()).toEqual([bears, shock].sort());
  });

  it("choosing none puts every revealed card on the bottom", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    spawn(game, "Raging Goblin");
    const { bears, shock, elves } = stack(game);
    pickFromZone(a);
    enter(game, "Aurora Awakener");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, elves)).toBe("library");
    expect([...library(game).slice(-3)].sort()).toEqual([bears, shock, elves].sort());
  });

  it("choosing all puts them all onto the battlefield", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    spawn(game, "Raging Goblin");
    const { bears, shock, elves } = stack(game);
    pickFromZone(a, bears, elves);
    enter(game, "Aurora Awakener");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(library(game).at(-1)).toBe(shock);
  });

  it("X is the colors among your permanents: green alone finds one", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    const { bears, shock, elves } = stack(game);
    const seen = pickFromZone(a, bears);
    enter(game, "Aurora Awakener");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("library");
    // Nothing past the one found was revealed: Shock is on top still.
    expect(library(game)[0]).toBe(shock);
  });
});
