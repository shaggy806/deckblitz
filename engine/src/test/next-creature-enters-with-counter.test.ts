/**
 * "When you next cast a creature spell this turn, that creature enters with
 * an additional +1/+1 counter on it" as a Saga creature's chapter (Summon:
 * Fenrir's II, Kumano Faces Kakkazan's): a delayed trigger keyed to the
 * controller's next creature spell this turn (rule 603.7), the counter put on
 * as that creature enters (614.1c), once. Its I and III are vocabulary
 * already: a basic land fetched tapped, and a draw if you control the
 * creature with the greatest power or one tied for it, checked as it resolves.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  hand,
  lands,
  nextTurn,
  pickFromZone,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** Summon: Fenrir cast on alice's turn 1, its chapter I fetching `fetch`. */
function castFenrir(game: Game, seat: Parameters<typeof pickFromZone>[0], fetch: ObjectId): ObjectId {
  lands(game, "Forest", 3);
  pickFromZone(seat, fetch);
  const fenrir = toHand(game, "Summon: Fenrir");
  cast(game, fenrir);
  return fenrir;
}

describe("Summon: Fenrir", () => {
  it("I: a basic land onto the battlefield tapped", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const fenrir = castFenrir(game, a, forest);
    expect(counters(game, fenrir, "lore")).toBe(1);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("II: the next creature spell this turn enters with a +1/+1 counter, and only that one", () => {
    const { game, a } = table();
    const fenrir = castFenrir(game, a, toLibrary(game, "Forest"));
    nextTurn(game); // bob's
    nextTurn(game); // alice's: chapter II
    settle(game);
    expect(counters(game, fenrir, "lore")).toBe(2);
    const first = toHand(game, "Grizzly Bears");
    cast(game, first);
    expect(counters(game, first)).toBe(1);
    const second = toHand(game, "Grizzly Bears");
    cast(game, second);
    expect(counters(game, second)).toBe(0);
  });

  it("II: only this turn", () => {
    const { game, a } = table();
    castFenrir(game, a, toLibrary(game, "Forest"));
    nextTurn(game);
    nextTurn(game); // chapter II, no creature cast
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears", A);
    nextTurn(game); // alice's turn 5: chapter III, the Saga sacrificed
    settle(game);
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
  });

  it("III: draws when tied for the greatest power, not when another's is greater; then it's sacrificed", () => {
    const handAtChapterIII = (opposing: string): { size: number; fenrir: ObjectId; game: Game } => {
      const { game, a } = table();
      spawn(game, opposing, B);
      const fenrir = castFenrir(game, a, toLibrary(game, "Forest"));
      for (let i = 0; i < 4; i += 1) nextTurn(game); // alice's turn 5
      settle(game);
      return { size: hand(game).length, fenrir, game };
    };
    const tied = handAtChapterIII("Hill Giant"); // 3/3 against Fenrir's 3
    const behind = handAtChapterIII("Craw Wurm"); // 6/4
    expect(tied.size).toBe(behind.size + 1);
    expect(zone(tied.game, tied.fenrir)).toBe("graveyard");
  });
});
