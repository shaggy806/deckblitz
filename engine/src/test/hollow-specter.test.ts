/**
 * Hollow Specter: "Whenever this creature deals combat damage to a player,
 * you may pay {X}. If you do, that player reveals X cards from their hand and
 * you choose one of them. That player discards that card." A paid `may` of
 * `{X}` (Stark's Ingenuity) around `discard-chosen`'s `reveals: "x"`
 * (Cabal Interrogator): the damaged player picks which X to show, and the
 * cards they keep back are never shown to anyone.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import { A, B, C, graveyard, hand, lands, registryOf, spawn, table, toHand } from "./harness.js";

const bobsHand = (game: Game): ObjectId[] => {
  for (const id of [...hand(game, B)]) game.debugMove(id, "library");
  return ["Lightning Bolt", "Grizzly Bears", "Craw Wurm", "Shock"].map((name) => toHand(game, name, B));
};

/** Alice's Specter hits Bob and its trigger asks Alice whether to pay. */
function hitBob(game: Game, a: ScriptedController): ObjectId {
  const specter = spawn(game, "Hollow Specter", A);
  a.declareAttackersFn = () => [{ attacker: specter, defender: B }];
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === A);
  return specter;
}

describe("Hollow Specter", () => {
  it("pays X = 2: Bob shows two cards, Alice picks one, Bob discards it — the cards he kept back stay hidden from every other seat", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 2);
    const [bolt, bears, wurm, shock] = bobsHand(game);
    hitBob(game, a);
    expect(game.state.players[B].life).toBe(18);
    const from = game.state.eventLog.length;
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    game.advanceUntil((s) => s.awaiting !== null);

    // Bob chooses which two to show, over his whole hand.
    const showing = game.state.awaiting;
    if (showing?.kind !== "choose-from-zone") throw new Error(`expected Bob's reveal, not ${showing?.kind}`);
    expect(showing.player).toBe(B);
    expect([showing.min, showing.max]).toEqual([2, 2]);
    for (const viewer of [A, C]) {
      const view = structuredClone(viewFor(game.state, registryOf(game), viewer));
      for (const id of [bolt, bears, wurm, shock]) expect(view.objects[id]).toBeUndefined();
      const told = JSON.stringify(view.events.slice(from));
      for (const name of ["Lightning Bolt", "Grizzly Bears", "Craw Wurm", "Shock"]) expect(told).not.toContain(name);
      for (const id of [bolt, bears, wurm, shock]) expect(told).not.toContain(`"${id}"`);
    }
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [bears, wurm] });

    // Alice chooses among the two shown alone.
    const choosing = game.state.awaiting;
    if (choosing?.kind !== "choose-from-zone") throw new Error(`expected Alice's pick, not ${choosing?.kind}`);
    expect(choosing.player).toBe(A);
    expect([...choosing.eligible].sort()).toEqual([bears, wurm].sort());
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [wurm] });
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);

    expect(graveyard(game, B)).toContain(wurm);
    expect(hand(game, B)).toEqual(expect.arrayContaining([bolt, bears, shock]));
    // The two Bob kept back were never shown to Alice or Carol.
    for (const viewer of [A, C]) {
      const view = viewFor(game.state, registryOf(game), viewer);
      for (const id of [bolt, shock]) expect(view.objects[id]).toBeUndefined();
      const told = JSON.stringify(view.events.slice(from));
      expect(told).not.toContain("Lightning Bolt");
      expect(told).not.toContain(`"${bolt}"`);
      expect(told).not.toContain(`"${shock}"`);
    }
  });

  it("declining the payment: nothing is revealed or discarded", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    bobsHand(game);
    hitBob(game, a);
    game.dispatch({ type: "choose-modes", player: A, modes: [] });
    game.advanceUntil((s) => s.awaiting !== null || s.turn.step === "postcombat-main");
    expect(game.state.awaiting?.kind === "choose-from-zone").toBe(false);
    expect(hand(game, B)).toHaveLength(4);
  });

  it("X at least Bob's hand: all of it is revealed with no question to Bob, and Alice picks", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const [, , wurm] = bobsHand(game);
    hitBob(game, a);
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 5 });
    game.advanceUntil((s) => s.awaiting !== null);
    const choosing = game.state.awaiting;
    if (choosing?.kind !== "choose-from-zone") throw new Error(`expected Alice's pick, not ${choosing?.kind}`);
    expect(choosing.player).toBe(A);
    expect(choosing.eligible).toHaveLength(4);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [wurm] });
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(graveyard(game, B)).toContain(wurm);
  });
});
