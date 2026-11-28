import { describe, expect, it } from "vitest";

import { A, B, activate, counters, enter, lands, pickPermanents, spawn, table, zone } from "./harness.js";

// "Each player chooses a nonland permanent and puts a doom counter on it" (Eye
// of Doom): a `vote` `choose` from the active player (rule 101.4), then
// `for-each-voted` `eachVote` — one counter a choice, put by its chooser, all
// at once.
describe("each player puts a counter on the permanent they chose (Eye of Doom)", () => {
  it("puts one counter for each player's choice, by that player, all at once", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const forest = spawn(game, "Forest", B);
    const offeredToA = pickPermanents(a, giant);
    pickPermanents(b, bears);
    const from = game.state.eventLog.length;
    const eye = enter(game, "Eye of Doom");
    // Nonland permanents only, anyone's, Eye of Doom itself among them.
    expect(offeredToA.offered).toContain(eye);
    expect(offeredToA.offered).not.toContain(forest);
    expect([counters(game, giant, "doom"), counters(game, bears, "doom")]).toEqual([1, 1]);
    const puts = game.state.eventLog
      .slice(from)
      .flatMap((e) => (e.type === "counter-added" && e.counter === "doom" ? [[e.object, e.by]] : []));
    expect(puts).toEqual([
      [giant, A],
      [bears, B],
    ]);
  });

  it("puts two on a permanent two players chose", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(a, giant);
    pickPermanents(b, giant);
    enter(game, "Eye of Doom");
    expect(counters(game, giant, "doom")).toBe(2);
  });

  it("destroys each permanent with a doom counter when sacrificed", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const elf = spawn(game, "Elvish Visionary", B);
    pickPermanents(a, giant);
    pickPermanents(b, bears);
    const eye = enter(game, "Eye of Doom");
    lands(game, "Wastes", 2);
    activate(game, eye, 0);
    expect([zone(game, giant), zone(game, bears), zone(game, elf), zone(game, eye)]).toEqual([
      "graveyard",
      "graveyard",
      "battlefield",
      "graveyard",
    ]);
  });
});
