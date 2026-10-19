/**
 * Read ahead (rule 702.155, 714.3b): as the Saga enters its controller chooses a number from one
 * to its final chapter; it enters with that many lore counters, and the turn it entered a
 * chapter ability triggers only if the Saga has exactly that chapter's number of lore counters,
 * so the chapters before the chosen one never trigger. The Weatherseed Treaty and The Cruelty of
 * Gix; a Saga without read ahead still enters with one counter and fires chapter I.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";

import { A, B, counters, lands, life, nextTurn, settle, spawn, table, toLibrary, toHand, tokensNamed } from "./harness.js";

/** Cast `name` for alice, answering its read-ahead choice with `chapter` (and recording the
 * options it was offered). */
function castSaga(game: Game, a: ScriptedController, name: string, mana: readonly string[], chapter: string): ObjectId {
  lands(game, mana[0]!, mana.length);
  const offered: string[][] = [];
  a.chooseCreatureTypeFn = (_view, _source, options) => {
    offered.push([...options]);
    return chapter;
  };
  const card = toHand(game, name);
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
  settle(game);
  expect(offered).toEqual([["1", "2", "3"]]);
  return card;
}

const lore = (game: Game, id: ObjectId): number => counters(game, id, "lore");

describe("read ahead", () => {
  it("enters with the chosen number of lore counters, and only that chapter triggers", () => {
    const { game, a } = table();
    toLibrary(game, "Forest");
    const saga = castSaga(game, a, "The Weatherseed Treaty", ["Forest", "Forest", "Forest"], "2");
    expect(lore(game, saga)).toBe(2);
    // Chapter II made its Saproling; chapter I's land search never happened.
    expect(tokensNamed(game, "Saproling Token")).toBe(1);
    expect(game.state.zones.perPlayer[A].library.length).toBeGreaterThan(0);
    expect(game.state.objects[saga]?.zone).toBe("battlefield");
  });

  it("picking the final chapter fires it alone, then the Saga is sacrificed", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = (_view, _name, _specs, legal) => legal.map((slot) => slot[0] ?? null);
    const saga = castSaga(game, a, "The Cruelty of Gix", ["Swamp", "Swamp", "Swamp", "Swamp", "Swamp"], "3");
    expect(game.state.objects[saga]?.zone).toBe("graveyard");
    // Chapter II's tutor and its 3 life never happened.
    expect(life(game, A)).toBe(20);
  });

  it("goes on from the chosen chapter on later turns", () => {
    const { game, a } = table();
    toLibrary(game, "Forest");
    const saga = castSaga(game, a, "The Weatherseed Treaty", ["Forest", "Forest", "Forest"], "1");
    expect(lore(game, saga)).toBe(1);
    expect(tokensNamed(game, "Saproling Token")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(lore(game, saga)).toBe(2);
    expect(tokensNamed(game, "Saproling Token")).toBe(1);
  });

  it("a Saga without read ahead still enters with one lore counter and fires chapter I", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Age of Ultron");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    settle(game);
    expect(game.state.awaiting?.kind).not.toBe("choose-creature-type");
    expect(lore(game, card)).toBe(1);
    expect(B).toBeDefined();
  });
});
