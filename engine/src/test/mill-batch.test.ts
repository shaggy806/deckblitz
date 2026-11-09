/**
 * Several players milling at once is one event for a "whenever one or more
 * cards are milled" trigger (rule 603.2c; The Wise Mothman's ruling): it
 * triggers once, for the total. A player's own "you mill" still reads theirs.
 */
import { describe, expect, it } from "vitest";
import { counters, enter, pickTargets, ref, settle, spawn, table } from "./harness.js";

describe("a simultaneous mill", () => {
  it("triggers The Wise Mothman once, X being every nonland card milled", () => {
    const { game, a } = table({ players: 3, deck: "Grizzly Bears" });
    spawn(game, "The Wise Mothman");
    spawn(game, "Altar of the Brood");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    let fired = 0;
    a.chooseTargetsFn = () => {
      fired += 1;
      return [ref(one), ref(two)];
    };
    enter(game, "Grizzly Bears");
    settle(game);
    expect(fired).toBe(1);
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
  });

  it("one player's mill alone fires it with that player's count", () => {
    const { game, a } = table({ players: 2, deck: "Grizzly Bears" });
    spawn(game, "The Wise Mothman");
    spawn(game, "Altar of the Brood");
    const one = spawn(game, "Grizzly Bears");
    pickTargets(a, one);
    enter(game, "Grizzly Bears");
    settle(game);
    expect(counters(game, one)).toBe(1);
  });
});
