/**
 * "That player may pay any amount of mana. This Aura deals 2 damage to that
 * player. Prevent X of that damage, where X is the amount of mana that player
 * paid this way" (Power Leak, Errant Minion).
 *
 * `players-pay-any-amount` of one named player (`who: "active-player"`): that
 * player alone is asked, and `then` is about them. `damage`'s `prevent`: a
 * prevention effect of the resolution's own on the damage it deals (rules
 * 615.1, 615.4) — ordered with the others (616.1), doing nothing to damage that
 * can't be prevented (615.12).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, lands, life, ref, settle, spawn, table } from "./harness.js";

/** Run to `player`'s choose-modes question, and pay `amount` (0: decline). */
const pay = (game: Game, player: PlayerId, amount: number): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
  const awaiting = game.state.awaiting as { player: PlayerId } | null;
  expect(awaiting?.player).toBe(player);
  game.dispatch({ type: "choose-modes", player, modes: amount > 0 ? [0] : [], ...(amount > 0 ? { xValue: amount } : {}) });
};

/** Bob's next upkeep trigger from alice's Aura on his enchantment, resolved. */
const toBobsUpkeep = (game: Game): void => {
  game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.zones.shared.stack.length > 0);
};

describe("Power Leak: the enchanted enchantment's controller pays, and X of 2 is prevented", () => {
  const board = (islands: number) => {
    const { game } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    const leak = spawn(game, "Power Leak");
    game.state.objects[leak].attachedTo = anthem;
    lands(game, "Island", islands, B);
    lands(game, "Island", 3, A);
    return game;
  };

  it("paying 1 prevents 1 of it", () => {
    const game = board(3);
    toBobsUpkeep(game);
    pay(game, B, 1);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("declining is all 2, and paying more than 2 prevents only the 2", () => {
    const game = board(3);
    toBobsUpkeep(game);
    pay(game, B, 0);
    settle(game);
    expect(life(game, B)).toBe(18);
    toBobsUpkeep(game);
    pay(game, B, 3);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("with no mana, nobody is asked and all 2 is dealt", () => {
    const game = board(0);
    toBobsUpkeep(game);
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("on alice's own upkeep it does nothing: not her enchantment", () => {
    const game = board(3);
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === A && s.turn.number > 1);
    settle(game);
    expect(life(game, A)).toBe(20);
  });
});

describe("Errant Minion on a creature", () => {
  it("its controller pays 2 and takes nothing", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const minion = spawn(game, "Errant Minion");
    game.state.objects[minion].attachedTo = bear;
    lands(game, "Island", 2, B);
    toBobsUpkeep(game);
    pay(game, B, 2);
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("damage's prevent: a prevention effect, not less damage", () => {
  it("prevents that much of each event it deals", () => {
    const { game } = table();
    const source = spawn(game, "Glorious Anthem");
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0, prevent: 2 }, [ref(B)], { source });
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("prevents nothing of damage that can't be prevented (rule 615.12)", () => {
    const { game } = table();
    const source = spawn(game, "Glorious Anthem");
    game.debugApplyEffect(A, { kind: "damage-cant-be-prevented" }, []);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0, prevent: 2 }, [ref(B)], { source });
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("is ordered with a doubling as the player dealt it chooses (rule 616.1)", () => {
    const { game } = table();
    spawn(game, "Furnace of Rath");
    const source = spawn(game, "Glorious Anthem");
    // Prevent 2 first, then double the 1 left: 2. Doubled first: 4.
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0, prevent: 2 }, [ref(B)], { source });
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});
