/**
 * One choice of where the chosen cards of a `look-and-choose` go, made after
 * they're chosen and the same for all of them: `destination: "stay"` with a
 * `then` that's a `modal` over the chosen cards. Green Sun's Twilight is the
 * card ("put the chosen cards onto the battlefield or into your hand").
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, cast, lands, pickFromZone, pickModes, pt, table, toHand, toLibrary, zone } from "./harness.js";

type G = ReturnType<typeof table>["game"];

/** A library with these on top, the first on the very top. */
const stack = (game: G, names: readonly string[]): ObjectId[] => {
  const ids = names.map((name) => toLibrary(game, name));
  const library = game.state.zones.perPlayer[A].library;
  library.splice(0, library.length, ...ids, ...library.filter((id) => !ids.includes(id)));
  return ids;
};

const bottom = (game: G, n: number): ObjectId[] => game.state.zones.perPlayer[A].library.slice(-n).sort();

const SIX = ["Grizzly Bears", "Forest", "Sol Ring", "Runeclaw Bear", "Island", "Shock"];

describe("Green Sun's Twilight", () => {
  it("below X 5: a creature card and a land card go to hand, with no choice of where", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const [bear, forest, sol, deeper] = stack(game, ["Grizzly Bears", "Forest", "Sol Ring", "Runeclaw Bear"]);
    const seen = pickFromZone(a, bear, forest);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 2 });
    // X plus one cards, and only the creature and land cards among them.
    expect(seen.offered).toEqual([bear, forest]);
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(asked).toBe(0);
    expect(bottom(game, 1)).toEqual([sol]);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(deeper);
  });

  it("at X 5: both chosen cards onto the battlefield, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const [bear, forest, sol, bear2, island, shock] = stack(game, SIX);
    const seen = pickFromZone(a, bear, island);
    pickModes(a, 0);
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(seen.offered).toEqual([bear, forest, bear2, island]);
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
    // Put onto the battlefield, not played and not tapped.
    expect(game.state.objects[island].tapped).toBeFalsy();
    expect(bottom(game, 4)).toEqual([forest, sol, bear2, shock].sort());
  });

  it("at X 5: or both into the hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const [bear, forest, sol, bear2, island, shock] = stack(game, SIX);
    pickFromZone(a, bear, forest);
    pickModes(a, 1);
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(bottom(game, 4)).toEqual([sol, bear2, island, shock].sort());
  });

  it("at X 5: one card alone still gets the choice, and none asks nothing", () => {
    const { game, a } = table();
    lands(game, "Forest", 12);
    const [bear] = stack(game, SIX);
    pickFromZone(a, bear);
    pickModes(a, 0);
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(zone(game, bear)).toBe("battlefield");

    const again = stack(game, SIX);
    pickFromZone(a);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(asked).toBe(0);
    expect(bottom(game, 6)).toEqual([...again].sort());
  });

  it("a land creature is the creature card or the land card, never both", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const [arbor, bear, forest] = stack(game, ["Dryad Arbor", "Grizzly Bears", "Forest", "Sol Ring", "Shock", "Shock"]);
    pickFromZone(a, arbor, bear);
    pickModes(a, 0);
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(zone(game, arbor)).toBe("battlefield");
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, forest)).toBe("library");
  });

  it("two creature cards can't both be chosen", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const [bear, , , bear2] = stack(game, SIX);
    pickFromZone(a, bear, bear2);
    pickModes(a, 0);
    const twilight = toHand(game, "Green Sun's Twilight");
    let refused = "";
    try {
      cast(game, twilight, { x: 5 });
    } catch (error) {
      refused = String(error);
    }
    // The seat's answer is cut to what the rule allows: one creature card.
    expect(refused).toBe("");
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, bear2)).toBe("library");
  });

  it("the chosen cards enter at the same time: a landfall creature sees the land", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const [lynx, forest] = stack(game, ["Steppe Lynx", "Forest", "Sol Ring", "Shock", "Shock", "Shock"]);
    // The land is picked first: put one after the other, it would be there before the Lynx.
    pickFromZone(a, forest, lynx);
    pickModes(a, 0);
    cast(game, toHand(game, "Green Sun's Twilight"), { x: 5 });
    expect(pt(game, lynx)).toEqual({ power: 2, toughness: 3 });
  });
});
