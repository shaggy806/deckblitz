/**
 * Skipping a step (rules 500.11, 614.10): a static's `skipsSteps` (Stasis's
 * untap steps, Eon Hub's upkeep steps, Damia's draw step, Gibbering
 * Descent's hellbent upkeep) and the one-shot `skip-step` (Fatigue, Molten
 * Firebird, Elfhame Sanctuary's "this turn"). A skipped upkeep or draw step
 * is passed as though it didn't exist — nothing "at the beginning of" it —
 * and a static's skip doesn't use up a "next" one (614.10a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, lands, nextTurn, pickModes, ref, spawn, table, toHand, toLibrary } from "./harness.js";

const tapped = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => game.state.objects[id].tapped === true);
const hand = (game: Game, player: PlayerId): number => game.state.zones.perPlayer[player].hand.length;
const life = (game: Game, player: PlayerId): number => game.state.players[player].life;
const stock = (game: Game, player: PlayerId, n = 10): void => {
  for (let i = 0; i < n; i += 1) toLibrary(game, "Wastes", player);
};
/** The events since `from` (an index into `game.events`). */
const since = (game: Game, from: number) => game.events.slice(from);

describe("skip-step", () => {
  it("Stasis: every player's untap step is skipped while it's there", () => {
    const { game } = table();
    const islands = lands(game, "Island", 2);
    const theirs = lands(game, "Island", 1, B);
    for (const id of [...islands, ...theirs]) game.state.objects[id].tapped = true;
    spawn(game, "Stasis");
    nextTurn(game); // bob's: skipped
    expect(tapped(game, theirs)).toEqual([true]);
    expect(game.events.some((e) => e.type === "untap-step-skipped" && e.player === B)).toBe(true);
    // Alice's: skipped too, so her Islands are still tapped at her upkeep —
    // she can't pay {U}, and Stasis goes.
    nextTurn(game);
    expect(tapped(game, islands)).toEqual([true, true]);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Stasis")).toBe(false);
    nextTurn(game); // bob's untap step happens again
    expect(tapped(game, theirs)).toEqual([false]);
  });

  it("Eon Hub: an upkeep step is skipped whole — no 'at the beginning of your upkeep' — and the turn goes on to draw", () => {
    const { game } = table();
    stock(game, B);
    spawn(game, "Eon Hub");
    spawn(game, "Forsaken Wastes"); // each player's upkeep: that player loses 1 life
    const before = life(game, B);
    const handBefore = hand(game, B);
    const from = game.events.length;
    nextTurn(game);
    expect(life(game, B)).toBe(before);
    expect(hand(game, B)).toBe(handBefore + 1);
    const events = since(game, from);
    expect(events.some((e) => e.type === "step-skipped" && e.player === B && e.step === "upkeep")).toBe(true);
    expect(events.some((e) => e.type === "step-began" && e.step === "upkeep")).toBe(false);
    expect(events.some((e) => e.type === "step-began" && e.step === "draw")).toBe(true);
  });

  it("Gibbering Descent's hellbent: its controller's upkeep is skipped with no cards in hand, not with one", () => {
    const { game } = table();
    stock(game, A);
    stock(game, B);
    for (const id of [...game.state.zones.perPlayer[A].hand]) game.debugMove(id, "graveyard");
    spawn(game, "Gibbering Descent");
    toHand(game, "Wastes", B);
    const bob = life(game, B);
    nextTurn(game); // bob's upkeep: he loses 1 and discards
    expect(life(game, B)).toBe(bob - 1);
    const alice = life(game, A);
    expect(hand(game, A)).toBe(0);
    nextTurn(game); // alice's, hellbent: skipped — no loss, no discard; she draws
    expect(life(game, A)).toBe(alice);
    expect(hand(game, A)).toBe(1);
    nextTurn(game);
    nextTurn(game); // a card in hand now: her upkeep happens
    expect(life(game, A)).toBe(alice - 1);
  });

  it("Damia: no draw step, but the upkeep fills the hand to seven", () => {
    const { game } = table();
    stock(game, A, 20);
    spawn(game, "Damia, Sage of Stone");
    for (const id of [...game.state.zones.perPlayer[A].hand]) game.debugMove(id, "graveyard");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    nextTurn(game);
    const from = game.events.length;
    nextTurn(game);
    expect(hand(game, A)).toBe(7);
    expect(since(game, from).some((e) => e.type === "step-skipped" && e.player === A && e.step === "draw")).toBe(true);
  });

  it("Fatigue: target player's next draw step is skipped, the one after isn't", () => {
    const { game } = table();
    stock(game, B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Fatigue"), { targets: [ref(B)] });
    expect(game.state.players[B].stepsToSkip).toEqual({ draw: 1 });
    const before = hand(game, B);
    nextTurn(game);
    expect(hand(game, B)).toBe(before);
    expect(game.state.players[B].stepsToSkip).toBeUndefined();
    nextTurn(game);
    nextTurn(game);
    expect(hand(game, B)).toBe(before + 1);
  });

  it("a static's skip doesn't use up a 'next' one: it waits for a draw step that isn't skipped (614.10a)", () => {
    const { game } = table();
    stock(game, B);
    lands(game, "Island", 2);
    const damia = spawn(game, "Damia, Sage of Stone", B);
    for (const id of [...game.state.zones.perPlayer[B].hand]) game.debugMove(id, "graveyard");
    for (let i = 0; i < 7; i += 1) toHand(game, "Wastes", B); // Damia's upkeep draws nothing
    cast(game, toHand(game, "Fatigue"), { targets: [ref(B)] });
    nextTurn(game); // skipped by Damia
    expect(hand(game, B)).toBe(7);
    expect(game.state.players[B].stepsToSkip).toEqual({ draw: 1 });
    game.debugMove(damia, "graveyard");
    nextTurn(game);
    nextTurn(game); // Fatigue's skip
    expect(hand(game, B)).toBe(7);
    expect(game.state.players[B].stepsToSkip).toBeUndefined();
  });

  it("Molten Firebird: when it dies its controller skips their next draw step, and it returns at the next end step", () => {
    const { game } = table();
    stock(game, A);
    const bird = spawn(game, "Molten Firebird");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bird)] });
    expect(game.state.players[A].stepsToSkip).toEqual({ draw: 1 });
    nextTurn(game); // bob's turn: the end step of alice's turn returned it
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Molten Firebird")).toBe(true);
    const before = hand(game, A);
    nextTurn(game);
    expect(hand(game, A)).toBe(before);
  });

  it("Elfhame Sanctuary: searching skips this turn's draw step, two of them only one, and nothing later", () => {
    const { game, a } = table();
    stock(game, A);
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    spawn(game, "Elfhame Sanctuary");
    spawn(game, "Elfhame Sanctuary");
    pickModes(a, 0); // search, each time
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    nextTurn(game);
    const before = hand(game, A);
    nextTurn(game); // two searches, one skipped draw
    expect(hand(game, A)).toBe(before + 2);
    expect(game.state.turn.skipsThisTurn).toEqual(["draw"]); // the second, left for nothing
    pickModes(a); // decline: she draws
    nextTurn(game);
    expect(game.state.turn.skipsThisTurn).toBeUndefined();
    nextTurn(game);
    expect(hand(game, A)).toBe(before + 3);
  });
});
