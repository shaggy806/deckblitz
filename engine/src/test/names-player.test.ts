/**
 * A player named as an ability is activated, not targeted
 * (`ActivatedAbility.namesPlayer` — Lodestone Bauble's "up to four target
 * basic land cards from a player's graveyard … That player draws a card at
 * the beginning of the next turn's upkeep"): with targets, the player whose
 * graveyard they're in; with none, still chosen (the card's ruling), asked
 * before anyone gets priority. Read as "that player" as it resolves, and by
 * the delayed ability it makes.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, hand, lands, nextTurn, ref, spawn, table, toGraveyard } from "./harness.js";

describe("namesPlayer (Lodestone Bauble)", () => {
  it("its targets' player: the lands go on top of their library, and they draw at the next upkeep", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bauble = spawn(game, "Lodestone Bauble");
    const forest = toGraveyard(game, "Forest", B);
    const island = toGraveyard(game, "Island", B);
    activate(game, bauble, 0, { targets: [ref(forest), ref(island)] });
    // In the order chosen: the last one chosen on top.
    const library = game.state.zones.perPlayer[B].library;
    expect(library.slice(0, 2)).toEqual([island, forest]);
    expect(game.state.zones.perPlayer[B].graveyard).toEqual([]);
    // Bob's upkeep: he draws the Island, then his draw step the Forest.
    const before = hand(game, B).length;
    nextTurn(game, "draw");
    expect(hand(game, B).length).toBe(before + 2);
    expect(hand(game, B)).toContain(island);
    expect(hand(game, B)).toContain(forest);
  });

  it("no targets: a player is still chosen, asked as it's activated, and draws at the next upkeep", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Wastes", 1);
    const bauble = spawn(game, "Lodestone Bauble");
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [texts.findIndex((t) => t.includes(C))];
    };
    activate(game, bauble, 0, { targets: [] });
    expect(asked).toHaveLength(1);
    // Every player, the activator too.
    expect(asked[0]).toHaveLength(3);
    expect(asked[0].some((t) => t.includes(A))).toBe(true);
    // Bob's upkeep comes first: carol draws then, and only then.
    const bob = hand(game, B).length;
    const carol = hand(game, C).length;
    nextTurn(game, "draw");
    expect(hand(game, B).length).toBe(bob + 1);
    expect(hand(game, C).length).toBe(carol + 1);
    nextTurn(game, "draw");
    expect(hand(game, C).length).toBe(carol + 2);
  });

  it("the targets share a graveyard: one from each player's is refused", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bauble = spawn(game, "Lodestone Bauble");
    const mine = toGraveyard(game, "Forest", A);
    const theirs = toGraveyard(game, "Forest", B);
    expect(() => activate(game, bauble, 0, { targets: [ref(mine), ref(theirs)] })).toThrow(/target/i);
    // A nonbasic land isn't a legal target.
    const other = toGraveyard(game, "Evolving Wilds", B);
    expect(() => activate(game, bauble, 0, { targets: [ref(other)] })).toThrow(/target/i);
  });
});
