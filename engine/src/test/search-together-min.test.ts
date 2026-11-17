/**
 * A search whose finds must have different names (`together: {
 * distinctNames }`) asks for no more than one answer can hold: Burning-Rune
 * Demon's "exactly two cards … that have different names" over a library of
 * one name was a `choose-from-zone` of min 2 that no pick could meet, so the
 * game stopped there. A stated quality may be left unfound (rule 701.23b),
 * so finding the one is legal.
 */
import { describe, expect, it } from "vitest";
import { A, enter, hand, pickModes, table, toLibrary } from "./harness.js";

describe("a search for cards with different names", () => {
  it("Burning-Rune Demon over a library of one name asks for one, and the game goes on", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const asked: number[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(min);
      return eligible.slice(0, min);
    };
    const before = hand(game).length;
    enter(game, "Burning-Rune Demon");
    expect(asked[0]).toBe(1);
    expect(game.state.awaiting).toBe(null);
    expect(hand(game).length).toBe(before + 1);
  });

  it("with two names there are, it still asks for two", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const asked: number[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(min);
      const bears = eligible.find((id) => game.state.objects[id]?.cardName === "Grizzly Bears");
      const other = eligible.find((id) => game.state.objects[id]?.cardName !== "Grizzly Bears");
      return min === 2 && bears !== undefined && other !== undefined ? [bears, other] : eligible.slice(0, min);
    };
    enter(game, "Burning-Rune Demon");
    expect(asked[0]).toBe(2);
    expect(game.state.awaiting).toBe(null);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(1);
  });
});
