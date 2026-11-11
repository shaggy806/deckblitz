/**
 * "For each opponent, choose a nonland permanent that player controls.
 * Destroy one of them chosen at random" (Chaos Defiler): the controller's
 * choices as it resolves (a `vote` with `about`, rule 608.2d — no targets),
 * then one of what was chosen this way picked by the game's seeded
 * randomness (`choose-permanents`' `random` over `thisWay: "chosen"`).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, D, destroy, enter, settle, spawn, table, zone } from "./harness.js";

function board(seed: number, bobs = "Grizzly Bears") {
  const t = table({ players: 4, seed });
  const { game, a } = t;
  const bobsPick = spawn(game, bobs, B);
  const bobsOther = spawn(game, "Hill Giant", B);
  const bobsLand = spawn(game, "Forest", B);
  const carolsPick = spawn(game, "Sol Ring", C);
  const davesPick = spawn(game, "Savannah Lions", D);
  const mine = spawn(game, "Sol Ring", A);
  const picks = [bobsPick, carolsPick, davesPick];
  const asked: (readonly ObjectId[])[] = [];
  a.choosePermanentsFn = (_view, eligible) => {
    asked.push(eligible);
    return eligible.filter((id) => picks.includes(id)).slice(0, 1);
  };
  return { ...t, asked, picks, bobsPick, bobsOther, bobsLand, carolsPick, davesPick, mine };
}

describe("Chaos Defiler", () => {
  it("asks once per opponent, of their nonland permanents, and destroys exactly one of the chosen", () => {
    const t = board(1);
    const { game } = t;
    const defiler = enter(game, "Chaos Defiler");
    expect(t.asked).toHaveLength(3);
    expect(new Set(t.asked[0])).toEqual(new Set([t.bobsPick, t.bobsOther]));
    expect(t.asked[1]).toEqual([t.carolsPick]);
    expect(t.asked[2]).toEqual([t.davesPick]);
    expect(t.picks.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
    for (const id of [t.bobsOther, t.bobsLand, t.mine, defiler]) expect(zone(game, id)).toBe("battlefield");
  });

  it("picks at random among the chosen: every one of them, over seeds", () => {
    const hit = new Set<number>();
    for (let seed = 1; seed <= 40 && hit.size < 3; seed += 1) {
      const t = board(seed);
      enter(t.game, "Chaos Defiler");
      const gone = t.picks.filter((id) => zone(t.game, id) === "graveyard");
      expect(gone).toHaveLength(1);
      hit.add(t.picks.indexOf(gone[0]));
    }
    expect(hit.size).toBe(3);
  });

  it("an indestructible one chosen is never the one picked while another can be destroyed (the ruling)", () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      const t = board(seed, "Darksteel Myr");
      enter(t.game, "Chaos Defiler");
      expect(zone(t.game, t.bobsPick)).toBe("battlefield");
      expect([t.carolsPick, t.davesPick].filter((id) => zone(t.game, id) === "graveyard")).toHaveLength(1);
    }
  });

  it("does it again when it dies", () => {
    const t = board(3);
    const { game } = t;
    const defiler = enter(game, "Chaos Defiler");
    expect(t.picks.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
    t.asked.length = 0;
    destroy(game, defiler);
    settle(game);
    expect(zone(game, defiler)).toBe("graveyard");
    // The two still there are chosen again (the third opponent has nothing
    // left of the picks, and is asked about what else they control, if any).
    expect(t.picks.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("with one opponent, the one chosen is destroyed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    a.choosePermanentsFn = () => [giant];
    enter(game, "Chaos Defiler");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
