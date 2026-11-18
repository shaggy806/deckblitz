/**
 * "The total power of the cards exiled this way" — an `aggregate` sum of
 * power over the resolution's `{ thisWay: "exiled" }` set, each card read
 * where it went (exile is public: its printed power, a characteristic-
 * defining ability's as it works there, rule 604.3). Stitcher Geralf: "Each
 * player mills three cards. Exile up to two creature cards put into
 * graveyards this way. Create an X/X blue Zombie creature token, where X is
 * the total power of the cards exiled this way."
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, named, pickFromZone, pt, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const GERALF = "Stitcher Geralf";
const ZOMBIE = "Zombie Token (Stitcher Geralf)";

const zombies = (game: Game): ObjectId[] =>
  named(game, ZOMBIE, A).filter((id) => game.state.objects[id].zone === "battlefield");

describe("Stitcher Geralf", () => {
  it("exiles the two chosen milled creature cards and makes a Zombie of their total power", () => {
    const { game, a } = table();
    const geralf = spawn(game, GERALF);
    lands(game, "Island", 3);
    // Tops of the libraries, last spawned on top.
    const wurm = toLibrary(game, "Craw Wurm", A); // 6/4
    toLibrary(game, "Wastes", A);
    const bears = toLibrary(game, "Grizzly Bears", A); // 2/2
    const giant = toLibrary(game, "Hill Giant", B); // 3/3
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Wastes", B);
    // Already in a graveyard, not put there this way: never offered.
    const old = toGraveyard(game, "Serra Angel", B);
    const seen = pickFromZone(a, wurm, bears);
    activate(game, geralf);
    expect([...seen.offered].sort()).toEqual([wurm, bears, giant].sort());
    expect(seen.offered).not.toContain(old);
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
    const [token] = zombies(game);
    expect(pt(game, token)).toEqual({ power: 8, toughness: 8 });
  });

  it("one card exiled: X is its power alone", () => {
    const { game, a } = table();
    const geralf = spawn(game, GERALF);
    lands(game, "Island", 3);
    const giant = toLibrary(game, "Hill Giant", B);
    toLibrary(game, "Craw Wurm", A);
    pickFromZone(a, giant);
    activate(game, geralf);
    expect(zone(game, giant)).toBe("exile");
    expect(pt(game, zombies(game)[0])).toEqual({ power: 3, toughness: 3 });
  });

  it("a characteristic-defining power is read in exile (rule 604.3)", () => {
    const { game, a } = table();
    const geralf = spawn(game, GERALF);
    lands(game, "Island", 3);
    // Tarmogoyf in exile: card types among cards in all graveyards — the
    // milled Wastes (land) and Lightning Bolt (instant) left there: 2/3.
    toLibrary(game, "Lightning Bolt", B);
    const goyf = toLibrary(game, "Tarmogoyf", A);
    pickFromZone(a, goyf);
    activate(game, geralf);
    expect(zone(game, goyf)).toBe("exile");
    expect(pt(game, zombies(game)[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("nothing exiled (up to two): the 0/0 Zombie is made and dies", () => {
    const { game, a } = table();
    const geralf = spawn(game, GERALF);
    lands(game, "Island", 3);
    const bears = toLibrary(game, "Grizzly Bears", A);
    pickFromZone(a);
    activate(game, geralf);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zombies(game)).toHaveLength(0);
  });

  it("milled cards a replacement exiles weren't put into graveyards this way (its ruling)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    const geralf = spawn(game, GERALF);
    lands(game, "Island", 3);
    const wurm = toLibrary(game, "Craw Wurm", A);
    const seen = pickFromZone(a, wurm);
    activate(game, geralf);
    expect(seen.offered).toEqual([]);
    expect(zone(game, wurm)).toBe("exile");
    expect(zombies(game)).toHaveLength(0);
  });
});
