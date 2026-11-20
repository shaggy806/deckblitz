/**
 * A search with a slot for each permanent matching a filter, each filled by a
 * card with that permanent's name (`SearchTogether` `{ oneEachSameNameAs }`):
 * Doubling Chant's "for each creature you control, you may search your
 * library for a creature card with the same name as that creature. Put those
 * cards onto the battlefield, then shuffle."
 */
import { describe, expect, it } from "vitest";

import type { ZoneChoiceTogether } from "../zone-choice-together.js";
import { fitsTogether } from "../zone-choice-together.js";
import { A, cast, lands, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Doubling Chant", () => {
  it("finds a card of each creature's name, two for two of one name, and only creature cards", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const libBears = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears")];
    const libGiant = toLibrary(game, "Hill Giant");
    const elves = toLibrary(game, "Llanowar Elves");
    lands(game, "Forest", 6);
    let together: ZoneChoiceTogether | undefined;
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      const awaiting = game.state.awaiting;
      together = awaiting !== null && "together" in awaiting ? (awaiting.together as ZoneChoiceTogether) : undefined;
      return [libBears[0], libBears[1], libGiant];
    };
    cast(game, toHand(game, "Doubling Chant"));
    expect(offered).toEqual(expect.arrayContaining([...libBears, libGiant]));
    expect(offered).not.toContain(elves);
    expect(together).toBeDefined();
    // Three Bears for two Bears is one too many.
    expect(fitsTogether(together!, libBears)).toBe(false);
    expect(fitsTogether(together!, [libBears[0], libBears[1], libGiant])).toBe(true);
    expect(zone(game, libBears[0])).toBe("battlefield");
    expect(zone(game, libBears[1])).toBe("battlefield");
    expect(zone(game, libBears[2])).toBe("library");
    expect(zone(game, libGiant)).toBe("battlefield");
    expect(game.state.objects[libGiant].controller).toBe(A);
  });

  it("finds nothing for a name with no creature of it", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    let offered: readonly string[] = ["x"];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    cast(game, toHand(game, "Doubling Chant"));
    expect(offered).not.toContain(bears);
    expect(zone(game, bears)).toBe("library");
  });
});
