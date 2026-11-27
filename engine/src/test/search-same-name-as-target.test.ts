/**
 * A library search for a card with the same name as a spell's target: the
 * search's `filter: { sameNameWith: 0 }` reads the target slot (March of
 * Burgeoning Life: "Choose target creature with mana value less than X.
 * Search your library for a creature card with the same name as that
 * creature, put it onto the battlefield tapped, then shuffle.").
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("March of Burgeoning Life", () => {
  it("finds a creature card of the target's name, any controller's target, and puts it in tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const theirs = spawn(game, "Grizzly Bears", B);
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    cast(game, toHand(game, "March of Burgeoning Life"), { targets: [ref(theirs)], x: 3 });
    expect(offered).toEqual([bears]);
    expect(offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("a creature of mana value X isn't a target", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const march = toHand(game, "March of Burgeoning Life");
    expect(() => cast(game, march, { targets: [ref(bears)], x: 2 })).toThrow();
    expect(zone(game, march)).toBe("hand");
  });

  it("with its target gone, the spell does nothing (608.2b)", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const target = spawn(game, "Grizzly Bears", B);
    const bears = toLibrary(game, "Grizzly Bears");
    let searched = false;
    a.chooseFromZoneFn = () => {
      searched = true;
      return [];
    };
    cast(game, toHand(game, "March of Burgeoning Life"), { targets: [ref(target)], x: 3, settle: false });
    destroy(game, target);
    settle(game);
    expect(zone(game, target)).toBe("graveyard");
    expect(searched).toBe(false);
    expect(zone(game, bears)).toBe("library");
  });
});
