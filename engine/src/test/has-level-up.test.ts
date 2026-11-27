import { describe, expect, it } from "vitest";
import { A, B, counters, enter, keywords, pt, registryOf, spawn, table } from "./harness.js";

// "Each creature you control with level up" (Venerated Teacher): the
// `hasKeyword: "level-up"` filter, read off the text box's "Level up" line
// (rule 702.87a).
describe("a creature with level up (Venerated Teacher)", () => {
  it("puts two level counters on each creature you control with level up", () => {
    const { game } = table();
    const student = spawn(game, "Student of Warfare", A);
    const joraga = spawn(game, "Joraga Treespeaker", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Student of Warfare", B);
    const teacher = enter(game, "Venerated Teacher", A);
    expect(counters(game, student, "level")).toBe(2);
    expect(counters(game, joraga, "level")).toBe(2);
    // Level 2-6: 3/3 first strike (rule 711.2a).
    expect(pt(game, student)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, student).has("first-strike")).toBe(true);
    expect(counters(game, bears, "level")).toBe(0);
    expect(counters(game, teacher, "level")).toBe(0);
    expect(counters(game, theirs, "level")).toBe(0);
  });

  it("finds every leveler in the pool by its printed line", () => {
    const { game } = table();
    const levelers = [...registryOf(game).definitions()].filter((def) =>
      def.activated.some((a) => a.text.startsWith("Level up ")),
    );
    expect(levelers.length).toBeGreaterThan(20);
    const missed = levelers.filter((def) => !/(^|\n)Level up /.test(def.text)).map((def) => def.name);
    expect(missed).toEqual([]);
  });
});
