import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import { A, B, cast, lands, nextTurn, spawn, table, toHand } from "./harness.js";

/**
 * v1 doesn't cast a spell that would do nothing at all (`doesNothingNow`),
 * found by `bot:flags` in the kept games (2026-11-26): Mox Diamond with no
 * land card to discard goes straight to the graveyard; Backdraft with no
 * player having cast a sorcery this turn chooses no one.
 */
const v1 = (game: Game) => new HeuristicBotController(A, game.registry);
const casts = (game: Game, name: string): boolean => {
  const action = v1(game).act(game.controllerView(A));
  return action.type === "cast-spell" && game.state.objects[action.card]?.cardName === name;
};

describe("casts that would do nothing", () => {
  it("Mox Diamond with no land card in hand: held", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].hand = [];
    toHand(game, "Mox Diamond");
    expect(casts(game, "Mox Diamond")).toBe(false);
  });

  it("Mox Diamond with a land card to discard and the land drop made: cast", () => {
    const { game } = table({ step: "precombat-main" });
    game.state.zones.perPlayer[A].hand = [];
    toHand(game, "Mox Diamond");
    toHand(game, "Forest");
    game.state.rules = { ...game.state.rules, maxLandsPerTurn: 0 };
    expect(casts(game, "Mox Diamond")).toBe(true);
  });

  it("Backdraft with no sorcery cast this turn: held", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].hand = [];
    lands(game, "Mountain", 2);
    toHand(game, "Backdraft");
    expect(casts(game, "Backdraft")).toBe(false);
  });

  it("Backdraft once bob has cast a sorcery this turn: cast", () => {
    const { game } = table();
    nextTurn(game); // bob's turn
    game.state.zones.perPlayer[A].hand = [];
    lands(game, "Mountain", 5, B);
    cast(game, toHand(game, "Lava Axe", B), { player: B, targets: [{ kind: "player", player: A }] });
    lands(game, "Mountain", 2);
    toHand(game, "Backdraft");
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.priority.holder === A && s.awaiting === null);
    expect(casts(game, "Backdraft")).toBe(true);
  });

  it("Deflecting Swat with only a creature spell on the stack, nothing to retarget: held", () => {
    const { game } = table();
    nextTurn(game); // bob's turn
    game.state.zones.perPlayer[A].hand = [];
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B, settle: false });
    lands(game, "Mountain", 3);
    toHand(game, "Deflecting Swat");
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.priority.holder === A && s.awaiting === null);
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(casts(game, "Deflecting Swat")).toBe(false);
  });

  it("Deflecting Swat with bob's Lightning Bolt at alice's creature on the stack: cast at the Bolt", () => {
    const { game } = table();
    nextTurn(game); // bob's turn
    game.state.zones.perPlayer[A].hand = [];
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 2, B);
    lands(game, "Mountain", 1, B);
    // Bob's Bears still on the stack under his Bolt, as Sigarda was in the
    // live game: worth more, and nothing to retarget.
    cast(game, toHand(game, "Grizzly Bears", B), { player: B, settle: false });
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [{ kind: "object", object: giant }], settle: false });
    lands(game, "Mountain", 3);
    toHand(game, "Deflecting Swat");
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.priority.holder === A && s.awaiting === null);
    const action = v1(game).act(game.controllerView(A));
    expect(action.type).toBe("cast-spell");
    if (action.type === "cast-spell") expect(game.state.objects[action.targets?.[0]?.kind === "object" ? action.targets[0].object : giant]?.cardName).toBe("Lightning Bolt");
  });

  it("Gamble with no other card in hand: held, by v1 and by v2 — the random discard can only take the card found", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].hand = [];
    lands(game, "Mountain", 1);
    toHand(game, "Gamble");
    expect(casts(game, "Gamble")).toBe(false);
    const v2 = new EvalBotController(A, game.registry).act(game.controllerView(A));
    expect(v2.type === "cast-spell" && game.state.objects[v2.card]?.cardName === "Gamble").toBe(false);
  });

  it("Gamble with another card in hand: cast", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].hand = [];
    lands(game, "Mountain", 1);
    toHand(game, "Gamble");
    toHand(game, "Grizzly Bears");
    expect(casts(game, "Gamble")).toBe(true);
  });
});
