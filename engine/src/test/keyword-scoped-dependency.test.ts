/**
 * Rule 613.8a in layer 6, between two real cards: Chaosphere's "creatures
 * without flying have reach" depends on Archetype of Imagination's grant and
 * loss of flying, whichever arrived first.
 */

import { describe, expect, it } from "vitest";

import { A, B, keywords, spawn, table } from "./harness.js";

describe("a keyword-scoped static waits for what grants or removes its keyword (rule 613.8a)", () => {
  for (const chaosphereFirst of [true, false]) {
    const order = chaosphereFirst ? "Chaosphere first" : "Archetype first";

    it(`${order}: a flier that loses flying has reach, one that gains it doesn't`, () => {
      const { game } = table();
      if (chaosphereFirst) spawn(game, "Chaosphere");
      spawn(game, "Archetype of Imagination");
      if (!chaosphereFirst) spawn(game, "Chaosphere");
      const theirs = spawn(game, "Storm Crow", B);
      const mine = spawn(game, "Grizzly Bears", A);
      expect(keywords(game, theirs).has("flying")).toBe(false);
      expect(keywords(game, theirs).has("reach")).toBe(true);
      expect(keywords(game, mine).has("flying")).toBe(true);
      expect(keywords(game, mine).has("reach")).toBe(false);
    });
  }
});
