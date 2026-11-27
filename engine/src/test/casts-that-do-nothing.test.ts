import { describe, expect, it } from "vitest";

import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import { A, B, cast, lands, nextTurn, table, toHand } from "./harness.js";

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
});
