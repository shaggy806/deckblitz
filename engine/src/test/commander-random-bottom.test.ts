/**
 * A commander exiled off the top of its owner's library (it had declined the
 * command zone before), then going to the bottom "in a random order" with the
 * rest: rule 903.9b asks again, and that answer comes after the others have
 * moved, so a declined commander must still land at random among them rather
 * than last. Venture Forth (`reveal-until`), Bloodbraid Elf (cascade, rule
 * 702.85a) and discover (701.57a) each exile first.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, quiet, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

/** Those on top of the library, first named on top. */
function stack(game: Game, names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

/** To the owner's 903.9b question and on to the end, with `answer` given. */
function answerAndFinish(game: Game, toCommandZone: boolean): void {
  game.advanceUntil((s) => s.awaiting?.kind === "commander-replacement" || quiet(s));
  const awaiting = game.state.awaiting;
  expect(awaiting?.kind === "commander-replacement" && awaiting.intendedZone).toBe("library");
  game.dispatch({ type: "commander-replacement", player: A, toCommandZone });
  game.advanceUntil(quiet);
}

/** Each way there: the cards it stacks, which is the commander, and how many go on the bottom. */
const WAYS: readonly {
  readonly name: string;
  readonly cards: readonly string[];
  readonly general: number;
  readonly staysOut: readonly number[];
  readonly start: (game: Game) => void;
}[] = [
  {
    name: "Venture Forth",
    cards: ["Opt", "Mulldrifter", "Llanowar Elves", "Lightning Bolt", "Grizzly Bears"],
    general: 1,
    staysOut: [],
    start: (game) => {
      lands(game, "Forest", 4);
      cast(game, toHand(game, "Venture Forth"), { settle: false });
    },
  },
  {
    name: "cascade",
    cards: ["Island", "Mulldrifter", "Swamp", "Forest", "Grizzly Bears"],
    general: 1,
    staysOut: [],
    start: (game) => {
      lands(game, "Mountain", 2);
      lands(game, "Forest", 2);
      cast(game, toHand(game, "Bloodbraid Elf"), { settle: false });
    },
  },
  {
    name: "discover",
    cards: ["Island", "Mulldrifter", "Swamp", "Forest", "Grizzly Bears"],
    general: 1,
    // The card found goes to the hand, not cast.
    staysOut: [4],
    start: (game) => {
      game.debugApplyEffect(A, { kind: "discover", amount: 3 }, []);
    },
  },
];

describe.each(WAYS)("$name", ({ cards, general, staysOut, start }) => {
  function run(seed: number, toCommandZone: boolean): { game: Game; ids: ObjectId[] } {
    const { game } = table({ seed });
    const ids = stack(game, cards);
    game.state.objects[ids[general]].isCommander = true;
    start(game);
    answerAndFinish(game, toCommandZone);
    return { game, ids };
  }

  it("declined, the commander lands at random among the rest, not always last", () => {
    const places = new Set<number>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const { game, ids } = run(seed, false);
      const going = ids.filter((_, i) => !staysOut.includes(i) && zone(game, ids[i]) === "library");
      expect(going).toContain(ids[general]);
      const bottom = library(game).slice(-going.length);
      expect([...bottom].sort()).toEqual([...going].sort());
      places.add(bottom.indexOf(ids[general]));
    }
    expect(places.size).toBeGreaterThan(2);
  });

  it("sent to the command zone, the rest go without it", () => {
    const { game, ids } = run(3, true);
    expect(zone(game, ids[general])).toBe("command");
    expect(library(game)).not.toContain(ids[general]);
  });
});
