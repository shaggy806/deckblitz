/**
 * "As long as the top card of your library is …": the static condition
 * `library-top`, your library's top card matching a filter, read live.
 * Vampire Nocturnus (black: it and other Vampires get +2/+1 and flying) and
 * Mul Daya Channelers (a creature card: +3/+3; a land card: a mana ability).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, keywords, pt, spawn, table, toLibrary } from "./harness.js";

const stats = (game: Game, id: ObjectId): [number, number] => {
  const { power, toughness } = pt(game, id);
  return [power, toughness];
};

describe("the top card of your library", () => {
  it("Vampire Nocturnus: black on top, it and other Vampires you control get +2/+1 and flying", () => {
    const { game } = table({ deck: "Plains" });
    const nocturnus = spawn(game, "Vampire Nocturnus");
    const other = spawn(game, "Vampire Lacerator");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Vampire Lacerator", B);
    expect(stats(game,nocturnus)).toEqual([3, 3]);
    toLibrary(game, "Swamp");
    // A Swamp is colourless: still nothing.
    expect(stats(game,nocturnus)).toEqual([3, 3]);
    toLibrary(game, "Dark Ritual");
    expect(stats(game,nocturnus)).toEqual([5, 4]);
    expect(keywords(game, nocturnus)).toContain("flying");
    expect(stats(game,other)).toEqual([4, 3]);
    expect(keywords(game, other)).toContain("flying");
    expect(stats(game,bears)).toEqual([2, 2]);
    expect(stats(game,theirs)).toEqual([2, 2]);
    expect(keywords(game, theirs)).not.toContain("flying");
  });

  it("Vampire Nocturnus: the bonus goes as the black card leaves the top", () => {
    const { game } = table({ deck: "Plains" });
    const nocturnus = spawn(game, "Vampire Nocturnus");
    toLibrary(game, "Dark Ritual");
    expect(stats(game,nocturnus)).toEqual([5, 4]);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    expect(stats(game,nocturnus)).toEqual([3, 3]);
    expect(keywords(game, nocturnus)).not.toContain("flying");
  });

  it("an empty library is no black card", () => {
    const { game } = table({ deck: "Plains" });
    const nocturnus = spawn(game, "Vampire Nocturnus");
    for (const id of [...game.state.zones.perPlayer[A].library]) game.debugMove(id, "exile");
    expect(game.state.zones.perPlayer[A].library).toHaveLength(0);
    expect(stats(game,nocturnus)).toEqual([3, 3]);
  });

  it("Mul Daya Channelers: a creature card on top, +3/+3; a land card, its mana ability", () => {
    const { game } = table({ deck: "Plains" });
    const channelers = spawn(game, "Mul Daya Channelers");
    const manaAbility = (): boolean =>
      game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === channelers);
    // A Plains on top: the ability, no bonus.
    expect(stats(game,channelers)).toEqual([2, 2]);
    expect(manaAbility()).toBe(true);
    toLibrary(game, "Grizzly Bears");
    expect(stats(game,channelers)).toEqual([5, 5]);
    expect(manaAbility()).toBe(false);
    // Dryad Arbor: both (the ruling).
    toLibrary(game, "Dryad Arbor");
    expect(stats(game,channelers)).toEqual([5, 5]);
    expect(manaAbility()).toBe(true);
  });
});
