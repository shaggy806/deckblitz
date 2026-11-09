/**
 * "Roll two dN and choose one result" (rule 706.4): a `roll-dice` whose `then` is
 * a `choose-value` of `"roll-result"`, the chosen result read as `"x"` and the
 * other as `{ roll: "other" }` — Reckless, Valiant and Wild Endeavor. The rolls
 * are read back off `GameState.lastRoll`, the seed deciding them.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, D, lands, named, spawn, table, toHand, toLibrary, tokensNamed, zone } from "./harness.js";
import { lastRollIn } from "../random-results.js";

const BEARS = "Grizzly Bears"; // 2/2
const DREADMAW = "Colossal Dreadmaw"; // 6/6
const WURM = "Craw Wurm"; // 6/4

/** Answers the menu with `pick` of the results it offers, recording them. */
function answering(seat: ScriptedController, pick: "high" | "low"): { offered: readonly string[] } {
  const asked: { offered: readonly string[] } = { offered: [] };
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    asked.offered = options;
    const sorted = [...options].sort((x, y) => Number(x) - Number(y));
    return pick === "high" ? sorted[sorted.length - 1] : sorted[0];
  };
  return asked;
}

const rolled = (game: Game): readonly number[] => lastRollIn(game.state)?.results ?? [];

/** A seed whose first roll of two `sides`-sided dice comes out to these two
 * results apart (or the same): the search is short, on the seeded stream. */
function seedRolling(card: string, land: string, cost: number, apart: boolean): { seed: number } {
  for (let seed = 1; seed < 400; seed += 1) {
    const { game, a } = table({ seed });
    lands(game, land, cost);
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    cast(game, toHand(game, card));
    const [x, y] = rolled(game);
    if ((x !== y) === apart) return { seed };
  }
  throw new Error("no such seed");
}

describe("Reckless Endeavor", () => {
  it("offers both results, deals the chosen one to each creature and makes the other in Treasures", () => {
    const { seed } = seedRolling("Reckless Endeavor", "Mountain", 7, true);
    const { game, a } = table({ seed });
    lands(game, "Mountain", 7);
    const asked = answering(a, "low");
    cast(game, toHand(game, "Reckless Endeavor"));
    const [x, y] = rolled(game);
    const low = Math.min(x, y);
    const high = Math.max(x, y);
    expect([...asked.offered].map(Number).sort((p, q) => p - q)).toEqual([low, high]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(high);
  });

  it("the choice decides who dies: the high one kills a big creature, the low one needn't", () => {
    const { seed } = seedRolling("Reckless Endeavor", "Mountain", 7, true);
    const { game, a } = table({ seed });
    lands(game, "Mountain", 7);
    const bears = spawn(game, BEARS);
    const dreadmaw = spawn(game, DREADMAW, B);
    answering(a, "high");
    cast(game, toHand(game, "Reckless Endeavor"));
    const [x, y] = rolled(game);
    const high = Math.max(x, y);
    const low = Math.min(x, y);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(low);
    expect(zone(game, bears)).toBe(high >= 2 ? "graveyard" : "battlefield");
    expect(zone(game, dreadmaw)).toBe(high >= 6 ? "graveyard" : "battlefield");
    if (high < 6) expect(game.state.objects[dreadmaw].damageMarked).toBe(high);
  });

  it("isn't asked when both dice agree: that result both ways", () => {
    const { seed } = seedRolling("Reckless Endeavor", "Mountain", 7, false);
    const { game, a } = table({ seed });
    lands(game, "Mountain", 7);
    let asked = false;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    cast(game, toHand(game, "Reckless Endeavor"));
    const [x] = rolled(game);
    expect(asked).toBe(false);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(x);
  });

  it("reaches each player's creatures at four players", () => {
    const { seed } = seedRolling("Reckless Endeavor", "Mountain", 7, true);
    const { game, a } = table({ seed, players: 4 });
    lands(game, "Mountain", 7);
    const ids = [spawn(game, "Llanowar Elves", B), spawn(game, "Llanowar Elves", C), spawn(game, "Llanowar Elves", D)];
    answering(a, "high");
    cast(game, toHand(game, "Reckless Endeavor"));
    expect(ids.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
  });
});

describe("Valiant Endeavor", () => {
  it("destroys power at or above the chosen result, and makes the other in Knights", () => {
    const { seed } = seedRolling("Valiant Endeavor", "Plains", 6, true);
    const { game, a } = table({ seed });
    lands(game, "Plains", 6);
    const bears = spawn(game, BEARS);
    const dreadmaw = spawn(game, DREADMAW, B);
    answering(a, "low");
    cast(game, toHand(game, "Valiant Endeavor"));
    const [x, y] = rolled(game);
    const low = Math.min(x, y);
    expect(zone(game, dreadmaw)).toBe("graveyard"); // 6 is at least any d6.
    expect(zone(game, bears)).toBe(low <= 2 ? "graveyard" : "battlefield");
    expect(tokensNamed(game, "Knight Token", A)).toBe(Math.max(x, y));
  });

  it("the Knights it makes aren't destroyed: they come after", () => {
    const { seed } = seedRolling("Valiant Endeavor", "Plains", 6, true);
    const { game, a } = table({ seed });
    lands(game, "Plains", 6);
    const wurm = spawn(game, WURM);
    answering(a, "high");
    cast(game, toHand(game, "Valiant Endeavor"));
    const [x, y] = rolled(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(tokensNamed(game, "Knight Token", A)).toBe(Math.min(x, y));
  });
});

describe("Wild Endeavor", () => {
  it("makes the chosen result in Beasts and fetches up to the other in basics, tapped", () => {
    const { seed } = seedRolling("Wild Endeavor", "Forest", 6, true);
    const { game, a } = table({ seed });
    lands(game, "Forest", 6);
    for (let i = 0; i < 8; i += 1) toLibrary(game, "Forest");
    answering(a, "high");
    let most = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, max);
    };
    const before = named(game, "Forest");
    cast(game, toHand(game, "Wild Endeavor"));
    const [x, y] = rolled(game);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(Math.max(x, y));
    expect(most).toBe(Math.min(x, y));
    const fetched = named(game, "Forest").filter((id) => !before.includes(id));
    expect(fetched.length).toBe(Math.min(x, y));
    expect(fetched.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
