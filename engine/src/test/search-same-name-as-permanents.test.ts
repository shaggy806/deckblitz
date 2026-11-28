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
import { A, B, cast, lands, pickPermanents, spawn, table, toHand, toLibrary, zone } from "./harness.js";

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
    a.chooseModesFn = () => [0];
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
    a.chooseModesFn = () => [0];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    cast(game, toHand(game, "Doubling Chant"));
    expect(offered).not.toContain(bears);
    expect(zone(game, bears)).toBe("library");
  });

  it("declined, searches nothing and leaves the library unshuffled", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    let searched = false;
    a.chooseModesFn = () => [];
    a.chooseFromZoneFn = () => {
      searched = true;
      return [];
    };
    const shuffles = game.eventsOfType("library-shuffled").filter((e) => e.player === A).length;
    cast(game, toHand(game, "Doubling Chant"));
    expect(searched).toBe(false);
    expect(zone(game, bears)).toBe("library");
    expect(game.eventsOfType("library-shuffled").filter((e) => e.player === A).length).toBe(shuffles);
  });
});

describe("Clarion Ultimatum", () => {
  it("searches for the chosen permanents' names alone, a slot each, the finds entering tapped", () => {
    const { game, a } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const giant = spawn(game, "Hill Giant");
    const elves = spawn(game, "Llanowar Elves");
    const plains = lands(game, "Plains", 3);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const libBears = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Grizzly Bears")];
    const libGiant = toLibrary(game, "Hill Giant");
    const libElves = toLibrary(game, "Llanowar Elves");
    const libPlains = toLibrary(game, "Plains");
    // Both Bears and three Plains; not the Hill Giant or the Elves.
    const chosen = pickPermanents(a, bears[0], bears[1], plains[0], plains[1], plains[2]);
    a.chooseModesFn = () => [0];
    let together: ZoneChoiceTogether | undefined;
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      const awaiting = game.state.awaiting;
      together = awaiting !== null && "together" in awaiting ? (awaiting.together as ZoneChoiceTogether) : undefined;
      return [libBears[0], libBears[1], libPlains];
    };
    cast(game, toHand(game, "Clarion Ultimatum"));
    expect(chosen.offered).toEqual(expect.arrayContaining([giant, elves, ...bears]));
    expect(offered).toEqual(expect.arrayContaining([...libBears, libPlains]));
    expect(offered).not.toContain(libGiant);
    expect(offered).not.toContain(libElves);
    // Two chosen Bears are two slots: three Bears is one too many.
    expect(fitsTogether(together!, libBears)).toBe(false);
    expect(zone(game, libBears[0])).toBe("battlefield");
    expect(zone(game, libBears[1])).toBe("battlefield");
    expect(zone(game, libBears[2])).toBe("library");
    expect(zone(game, libPlains)).toBe("battlefield");
    expect(game.state.objects[libBears[0]].tapped).toBe(true);
    expect(game.state.objects[libPlains].tapped).toBe(true);
  });

  it("must choose five, and declined searches nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    let least = -1;
    a.choosePermanentsFn = (_view, eligible, min) => {
      least = min;
      return eligible.slice(0, 5);
    };
    a.chooseModesFn = () => [];
    let searched = false;
    a.chooseFromZoneFn = () => {
      searched = true;
      return [];
    };
    cast(game, toHand(game, "Clarion Ultimatum"));
    expect(least).toBe(5);
    expect(searched).toBe(false);
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Dichotomancy", () => {
  it("finds a card of each tapped nonland permanent's name in the opponent's library, under your control", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Hill Giant", B);
    spawn(game, "Forest", B, { tapped: true });
    spawn(game, "Llanowar Elves", A, { tapped: true });
    const theirBears = toLibrary(game, "Grizzly Bears", B);
    const theirGiant = toLibrary(game, "Hill Giant", B);
    const theirForest = toLibrary(game, "Forest", B);
    const theirElves = toLibrary(game, "Llanowar Elves", B);
    const myBears = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 9);
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [theirBears];
    };
    const shuffles = game.eventsOfType("library-shuffled").filter((e) => e.player === B).length;
    cast(game, toHand(game, "Dichotomancy"), { targets: [{ kind: "player", player: B }] });
    expect(offered).toContain(theirBears);
    expect(offered).not.toContain(theirGiant);
    expect(offered).not.toContain(theirForest);
    expect(offered).not.toContain(theirElves);
    expect(offered).not.toContain(myBears);
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(game.state.objects[theirBears].controller).toBe(A);
    expect(game.eventsOfType("library-shuffled").filter((e) => e.player === B).length).toBe(shuffles + 1);
  });
});
