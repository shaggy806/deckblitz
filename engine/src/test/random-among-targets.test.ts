/**
 * "Choose three target creature cards in your graveyard. Return two of them
 * at random to the battlefield and put the other on the bottom of your
 * library" (Sinister Waltz): `choose-random-card`'s `zone: "targets"` picks
 * among the spell's own targets still legal (rule 608.2b), and `others` does
 * what's said of the ones not picked. Written from the card's Oracle text and
 * ruling.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

function waltz(game: Game, targets: readonly ObjectId[], settleIt = true): void {
  lands(game, "Swamp", 3);
  lands(game, "Mountain", 2);
  cast(game, toHand(game, "Sinister Waltz"), { targets: targets.map(ref), settle: settleIt });
}

const libraryOf = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("Sinister Waltz", () => {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    it(`two of the three enter together under alice and the other goes to the bottom (seed ${seed})`, () => {
      const { game } = table({ seed });
      const cards = [
        toGraveyard(game, "Grizzly Bears"),
        toGraveyard(game, "Hill Giant"),
        toGraveyard(game, "Serra Angel"),
      ];
      const since = game.state.eventSeq;
      waltz(game, cards);
      const entered = cards.filter((id) => zone(game, id) === "battlefield");
      const other = cards.filter((id) => zone(game, id) === "library");
      expect(entered).toHaveLength(2);
      expect(other).toHaveLength(1);
      for (const id of entered) expect(game.state.objects[id].controller).toBe(A);
      expect(
        new Set(game.state.eventLog.flatMap((e) => (e.seq >= since && e.type === "permanent-entered-battlefield" ? [e.object] : []))),
      ).toEqual(new Set(entered));
      // The bottom is the list's end; the top, its first.
      expect(libraryOf(game).at(-1)).toBe(other[0]);
    });
  }

  it("each of the three can be the one left out", () => {
    const left = new Set<string>();
    for (let seed = 1; seed <= 30 && left.size < 3; seed += 1) {
      const { game } = table({ seed });
      const names = ["Grizzly Bears", "Hill Giant", "Serra Angel"];
      const cards = names.map((name) => toGraveyard(game, name));
      waltz(game, cards);
      cards.forEach((id, i) => {
        if (zone(game, id) === "library") left.add(names[i]);
      });
    }
    expect(left.size).toBe(3);
  });

  it("with only two targets still legal, both enter and nothing goes to the library (the ruling)", () => {
    const { game } = table();
    const cards = [
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Hill Giant"),
      toGraveyard(game, "Serra Angel"),
    ];
    const before = libraryOf(game).length;
    waltz(game, cards, false);
    game.debugMove(cards[1], "exile");
    settle(game);
    expect(zone(game, cards[0])).toBe("battlefield");
    expect(zone(game, cards[2])).toBe("battlefield");
    expect(zone(game, cards[1])).toBe("exile");
    expect(libraryOf(game).length).toBe(before);
  });

  it("a returned Clone's copy is chosen before the other goes to the library", () => {
    let asked = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      const { game } = table({ seed });
      const angel = spawn(game, "Serra Angel", B);
      const cards = [toGraveyard(game, "Clone"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
      const effect = game.registry.get("Sinister Waltz").effect;
      if (effect === null || effect === undefined) throw new Error("no effect");
      game.debugApplyEffect(A, effect, cards.map(ref));
      if (game.state.awaiting?.kind !== "choose-copy") continue;
      asked += 1;
      const whenAsked = cards.map((id) => zone(game, id));
      game.dispatch({ type: "choose-copy", player: A, copy: angel });
      expect(game.state.objects[cards[0]]).toMatchObject({ zone: "battlefield", copyOf: "Serra Angel" });
      const other = cards.filter((id) => zone(game, id) === "library");
      expect(other).toHaveLength(1);
      expect(libraryOf(game).at(-1)).toBe(other[0]);
      // The other waited in the graveyard while the copy was chosen.
      expect(whenAsked[cards.indexOf(other[0])]).toBe("graveyard");
    }
    expect(asked).toBeGreaterThan(0);
  });

  it("needs three targets", () => {
    const { game } = table();
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    expect(() => waltz(game, cards)).toThrow(/target/i);
  });
});
