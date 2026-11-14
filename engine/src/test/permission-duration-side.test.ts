/**
 * Whose turn a play permission's duration is read from, when it's given to a
 * player other than the effect's controller (`PlayGrant.durationOf`):
 *
 * - by default the side of the player it's given to — Casey & Raph,
 *   Hotheads' "until **that player's** next end step, they may play that card";
 * - `durationOf: "granter"`, the effect controller's — Rocco, Street Chef's
 *   "until **your** next end step, each player may play the card they exiled
 *   this way", Memory Vessel's "until your next turn, players may play cards
 *   they exiled this way".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, enter, nextTurn, pickModes, pickTargets, spawn, table, tokensNamed, toLibrary, toStep } from "./harness.js";

const offers = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some(
    (action) => (action.kind === "cast-spell" || action.kind === "play-land") && action.card === card,
  );

describe("Casey & Raph, Hotheads", () => {
  it("the target player's card is theirs to play until their own next end step, free", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0, 1);
    pickTargets(a, B, A);
    enter(game, "Casey & Raph, Hotheads");
    expect(game.state.objects[bears].zone).toBe("exile");
    expect(game.state.objects[bears].playPermission?.player).toBe(B);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
    // Alice's end step isn't bob's: the card is still his on his turn.
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(offers(game, B, bears)).toBe(true);
    // As bob's end step begins, it's over.
    toStep(game, "end", B);
    expect(game.state.objects[bears].playPermission).toBeUndefined();
    expect(offers(game, B, bears)).toBe(false);
  });

  it("cast without paying its mana cost: no lands needed", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Casey & Raph, Hotheads");
    nextTurn(game);
    game.dispatch({ type: "cast-spell", player: B, card: bears, via: "impulse", free: true, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });
});

describe('durationOf: "granter"', () => {
  it("Rocco: another player's card lasts through their end step, until Rocco's controller's next one", () => {
    const { game } = table();
    spawn(game, "Rocco, Street Chef");
    const forest = toLibrary(game, "Forest", B);
    toStep(game, "end", A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(game.state.objects[forest].playPermission?.player).toBe(B);
    // Bob's own end step comes and goes: still his to play.
    toStep(game, "end", B);
    expect(game.state.objects[forest].playPermission?.player).toBe(B);
    // Alice's next end step: gone.
    toStep(game, "end", A);
    expect(game.state.objects[forest].playPermission).toBeUndefined();
  });

  it("Memory Vessel: until your next turn, so bob may play his cards through his own turn", () => {
    const { game } = table();
    const vessel = spawn(game, "Memory Vessel");
    const forest = toLibrary(game, "Forest", B);
    activate(game, vessel);
    expect(game.state.objects[forest].playPermission?.player).toBe(B);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(offers(game, B, forest)).toBe(true);
    // Alice's next turn begins: gone.
    nextTurn(game);
    expect(game.state.objects[forest].playPermission).toBeUndefined();
  });
});
