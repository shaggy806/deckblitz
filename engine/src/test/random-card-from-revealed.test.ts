/**
 * `look-and-choose`'s `atRandom`: the game picks among the cards that may be
 * chosen, nobody is asked — Getaway Barrel's "put a random creature card from
 * among them onto the battlefield".
 */
import { describe, expect, it } from "vitest";
import { A, destroy, spawn, table, toLibrary, zone } from "./harness.js";

function barrelGame(seed: number, creatures: readonly string[]) {
  const t = table({ seed });
  const { game, a } = t;
  let asked = 0;
  a.chooseFromZoneFn = () => {
    asked += 1;
    return [];
  };
  const below = toLibrary(game, "Wastes");
  // `toLibrary` puts each on top: the creatures end up among the top thirteen.
  const ids = creatures.map((name) => toLibrary(game, name));
  const barrel = spawn(game, "Getaway Barrel");
  return { ...t, ids, barrel, below, asked: () => asked };
}

describe("Getaway Barrel", () => {
  it("puts exactly one of the revealed creature cards onto the battlefield, unasked", () => {
    const { game, ids, barrel, asked } = barrelGame(1, ["Grizzly Bears", "Hill Giant", "Craw Wurm"]);
    destroy(game, barrel);
    expect(asked()).toBe(0);
    const entered = ids.filter((id) => zone(game, id) === "battlefield");
    expect(entered.length).toBe(1);
    expect(game.state.objects[entered[0]].controller).toBe(A);
    // The others are now at the bottom, with the revealed Wastes.
    const library = game.state.zones.perPlayer[A].library;
    const rest = ids.filter((id) => id !== entered[0]);
    for (const id of rest) expect(library.indexOf(id)).toBeGreaterThanOrEqual(library.length - 13);
    expect(game.state.eventLog.some((e) => e.type === "chosen-at-random")).toBe(true);
  });

  it("picks by the game's seed: different seeds reach different creatures", () => {
    const picked = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game, ids, barrel } = barrelGame(seed, ["Grizzly Bears", "Hill Giant", "Craw Wurm"]);
      destroy(game, barrel);
      const entered = ids.filter((id) => zone(game, id) === "battlefield");
      expect(entered.length).toBe(1);
      picked.add(game.state.objects[entered[0]].cardName);
    }
    expect(picked.size).toBeGreaterThan(1);
  });

  it("with no creature card among them, nothing enters and all thirteen go to the bottom", () => {
    const { game, barrel } = barrelGame(1, []);
    const top = game.state.zones.perPlayer[A].library.slice(0, 13);
    destroy(game, barrel);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-13).sort()).toEqual([...top].sort());
  });
});
