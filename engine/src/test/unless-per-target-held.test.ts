/**
 * An `unless` asked once for each of the spell's own targets, the answers
 * held until the last is in (rule 101.4) — `for-each-unless`'s `of: {
 * targets }`, with `draw`'s and `return-to-hand`'s `atRelease`: Decoy
 * Gambit's "for each opponent, choose up to one target creature that player
 * controls, then return that creature to its owner's hand unless its
 * controller has you draw a card". The ruling: each opponent in turn order
 * answers knowing the answers before theirs; then you draw; then the
 * creatures go back together. A slot empty or gone illegal asks nobody.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, D, cast, hand, lands, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** Stop at the next choice, returning its question. */
const question = (game: Game) => {
  game.advanceUntil((s) => s.awaiting !== null);
  return game.state.awaiting;
};

/** Answer the `choose-modes` waiting: have the caster draw (mode 0) or not. */
const answer = (game: Game, draw: boolean): PlayerId => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-modes") throw new Error(`expected a question, got ${awaiting?.kind}`);
  game.dispatch({ type: "choose-modes", player: awaiting.player, modes: draw ? [0] : [] });
  return awaiting.player;
};

const offerOf = (game: Game, player: PlayerId) => {
  const offer = game.legalActions(player).find((la) => la.kind === "choose-modes");
  if (offer?.kind !== "choose-modes") throw new Error("no choose-modes offer");
  return offer;
};

/** Ten cards on top of alice's library, so a draw is seen. */
const stock = (game: Game): void => {
  for (let i = 0; i < 10; i += 1) toLibrary(game, "Island");
};

describe("Decoy Gambit", () => {
  it("the controller has you draw: the creature stays", () => {
    const { game } = table();
    stock(game);
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Decoy Gambit");
    const before = hand(game).length - 1;
    cast(game, card, { targets: [ref(bears), null, null], settle: false });
    question(game);
    const offer = offerOf(game, B);
    expect(offer.aboutObject).toBe(bears);
    expect(offer.modeTexts[0]).toContain("Grizzly Bears");
    expect(answer(game, true)).toBe(B);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });

  it("the controller declines: the creature goes back and nobody draws", () => {
    const { game } = table();
    stock(game);
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Decoy Gambit");
    const before = hand(game).length - 1;
    cast(game, card, { targets: [ref(bears), null, null], settle: false });
    question(game);
    answer(game, false);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
    expect(hand(game).length).toBe(before);
  });

  it("four players: asked in turn order, then every draw, then the returns together", () => {
    const { game } = table({ players: 4 });
    stock(game);
    lands(game, "Island", 3);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Llanowar Elves", C);
    const daves = spawn(game, "Hill Giant", D);
    const card = toHand(game, "Decoy Gambit");
    const before = hand(game).length - 1;
    cast(game, card, { targets: [ref(bobs), ref(carols), ref(daves)], settle: false });
    const asked: PlayerId[] = [];
    question(game);
    asked.push(answer(game, true));
    // Nothing happens until the last has answered (the ruling).
    question(game);
    expect(hand(game).length).toBe(before);
    asked.push(answer(game, false));
    question(game);
    expect(zone(game, carols)).toBe("battlefield");
    asked.push(answer(game, true));
    settle(game);
    expect(asked).toEqual([B, C, D]);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(zone(game, daves)).toBe("battlefield");
    expect(hand(game, C)).toContain(carols);
    // You draw, and only then are the creatures returned (the ruling).
    const log = game.state.eventLog;
    const lastDraw = log.findLastIndex((e) => e.type === "card-drawn" && e.player === A);
    const returned = log.findIndex((e) => e.type === "permanent-returned-to-hand" && e.object === carols);
    expect(lastDraw).toBeGreaterThanOrEqual(0);
    expect(returned).toBeGreaterThan(lastDraw);
  });

  it("two returned at once, and an empty slot asks nobody", () => {
    const { game } = table({ players: 4 });
    stock(game);
    lands(game, "Island", 3);
    const bobs = spawn(game, "Grizzly Bears", B);
    const daves = spawn(game, "Hill Giant", D);
    spawn(game, "Llanowar Elves", C);
    cast(game, toHand(game, "Decoy Gambit"), { targets: [ref(bobs), null, ref(daves)], settle: false });
    const asked: PlayerId[] = [];
    question(game);
    asked.push(answer(game, false));
    question(game);
    expect(zone(game, bobs)).toBe("battlefield");
    asked.push(answer(game, false));
    settle(game);
    expect(asked).toEqual([B, D]);
    expect(zone(game, bobs)).toBe("hand");
    expect(zone(game, daves)).toBe("hand");
  });

  it("a target gone before it resolves asks nobody, so you can't be made to draw for it", () => {
    const { game } = table({ players: 3 });
    stock(game);
    lands(game, "Island", 3);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Llanowar Elves", C);
    const card = toHand(game, "Decoy Gambit");
    const before = hand(game).length - 1;
    cast(game, card, { targets: [ref(bobs), ref(carols), null], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bobs)]);
    const asked: PlayerId[] = [];
    question(game);
    asked.push(answer(game, true));
    settle(game);
    expect(asked).toEqual([C]);
    expect(zone(game, carols)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });

  it("a creature that changed controller is no longer a legal target: its new controller isn't asked", () => {
    const { game } = table({ players: 3 });
    stock(game);
    lands(game, "Island", 3);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Llanowar Elves", C);
    cast(game, toHand(game, "Decoy Gambit"), { targets: [ref(bobs), ref(carols), null], settle: false });
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bobs)]);
    const asked: PlayerId[] = [];
    question(game);
    asked.push(answer(game, false));
    settle(game);
    expect(asked).toEqual([C]);
    expect(zone(game, carols)).toBe("hand");
    expect(zone(game, bobs)).toBe("battlefield");
  });
});
