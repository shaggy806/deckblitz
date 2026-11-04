import { describe, expect, it } from "vitest";

import { A, B, C, attack, cast, destroy, enter, hand, lands, life, nextTurn, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const active = (game: Game): PlayerId => game.state.turnOrder[game.state.turn.activePlayerIndex];
/** Whose turns come next, in order, from the one under way. */
const nextTurns = (game: Game, n: number): PlayerId[] => {
  const seen: PlayerId[] = [];
  for (let i = 0; i < n; i += 1) {
    nextTurn(game);
    seen.push(active(game));
  }
  return seen;
};
const skipped = (game: Game): number => game.events.filter((e) => e.type === "turn-skipped").length;

describe("skipping a turn (rules 500.11, 614.10)", () => {
  it("Meditate draws four and takes its caster's next turn away", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Meditate"));
    expect(hand(game).length).toBe(before + 4);
    expect(game.state.players[A].turnsToSkip).toBe(1);
    // Not this turn: one under way can't be skipped (614.10).
    expect(active(game)).toBe(A);
    expect(nextTurns(game, 3)).toEqual([B, B, A]);
    expect(game.state.players[A].turnsToSkip).toBeUndefined();
    expect(skipped(game)).toBe(1);
  });

  it("a skipped turn never began: the turn number passes over it", () => {
    const { game } = table();
    game.state.players[A].turnsToSkip = 1;
    const number = game.state.turn.number;
    nextTurn(game);
    expect(active(game)).toBe(B);
    nextTurn(game);
    expect(active(game)).toBe(B);
    expect(game.state.turn.number).toBe(number + 2);
  });

  it("Eater of Days skips the next two", () => {
    const { game } = table();
    enter(game, "Eater of Days");
    expect(game.state.players[A].turnsToSkip).toBe(2);
    expect(nextTurns(game, 4)).toEqual([B, B, B, A]);
  });

  it("two effects skip the next two, each satisfied by one (614.10a)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Meditate"));
    cast(game, toHand(game, "Meditate"));
    expect(nextTurns(game, 4)).toEqual([B, B, B, A]);
  });

  it("the rotation carries on past a skipped seat in a three-player game", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].turnsToSkip = 1;
    expect(nextTurns(game, 3)).toEqual([C, A, B]);
  });

  it("everyone owing one takes the rotation all the way round, and the round counts each pass", () => {
    const { game } = table();
    game.state.players[A].turnsToSkip = 1;
    game.state.players[B].turnsToSkip = 1;
    const round = game.state.turn.round ?? 1;
    nextTurn(game);
    // Bob's goes, then Alice's, and Bob takes the one after those.
    expect(active(game)).toBe(B);
    expect(game.state.turn.round).toBe(round + 1);
    expect(game.state.players[A].turnsToSkip).toBeUndefined();
    expect(game.state.players[B].turnsToSkip).toBeUndefined();
  });

  it("takes an extra turn as readily as any other", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const manta = enter(game, "Wormfang Manta");
    expect(game.state.players[A].turnsToSkip).toBe(1);
    destroy(game, manta);
    expect(zone(game, manta)).toBe("graveyard");
    expect(game.state.extraTurns).toEqual([A]);
    nextTurn(game);
    // The extra turn was the next of hers to begin, so the skip took it.
    expect(game.state.extraTurns).toEqual([]);
    expect(game.state.players[A].turnsToSkip).toBeUndefined();
    expect(active(game)).toBe(B);
    expect(game.state.turn.isExtra).toBe(false);
    // Her one after that, in the rotation, is hers again.
    expect(nextTurns(game, 1)).toEqual([A]);
  });

  it("an effect until your next turn waits through a skipped turn (614.10a)", () => {
    const { game } = table();
    game.state.players[A].turnsToSkip = 1;
    game.state.preventionShields.push({ untilTurnOf: A } as never);
    nextTurn(game);
    expect(game.state.preventionShields).toHaveLength(1);
    nextTurn(game);
    expect(active(game)).toBe(B);
    expect(game.state.preventionShields).toHaveLength(1);
    nextTurn(game);
    expect(active(game)).toBe(A);
    expect(game.state.preventionShields).toHaveLength(0);
  });
});

describe("what an effect says about that extra turn", () => {
  it("Warrior's Oath: this turn goes on; the extra turn's end step loses the game", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Warrior's Oath"));
    expect(game.state.delayedTriggers).toHaveLength(0);
    // This turn's end step isn't that turn's.
    nextTurn(game);
    expect(active(game)).toBe(A);
    expect(game.state.turn.isExtra).toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.delayedTriggers.map((t) => t.at)).toEqual(["this-turn-end-step"]);
    game.advanceUntil((s) => s.players[A].hasLost || s.turn.number > 3);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a skipped extra turn takes its end step's loss with it (614.10a)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Warrior's Oath"));
    game.state.players[A].turnsToSkip = 1;
    nextTurn(game);
    expect(active(game)).toBe(B);
    expect(game.state.delayedTriggers).toHaveLength(0);
    expect(game.state.extraTurnRiders).toBeUndefined();
    nextTurn(game);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("it lapses unfired if that turn's end step never comes, and doesn't fall to the next turn's", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Warrior's Oath"));
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(1);
    // Nothing in the pool ends a turn yet, so age the ability past its turn:
    // it's that turn's end step or none.
    const [oath] = game.state.delayedTriggers;
    game.state.delayedTriggers[0] = { ...oath, createdOnTurn: oath.createdOnTurn - 1 };
    nextTurn(game);
    expect(active(game)).toBe(B);
    expect(game.state.delayedTriggers).toHaveLength(0);
    nextTurn(game);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("two extra turns each keep their own (500.7: the most recent first)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Warrior's Oath"));
    cast(game, toHand(game, "Time Walk"));
    // Time Walk's comes first and carries nothing.
    nextTurn(game);
    expect(game.state.turn.isExtra).toBe(true);
    expect(game.state.delayedTriggers).toHaveLength(0);
    game.advanceUntil((s) => s.turn.number > 2);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.delayedTriggers).toHaveLength(1);
    game.advanceUntil((s) => s.players[A].hasLost || s.turn.number > 3);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Final Fortune, an instant: cast on someone else's turn, the extra turn comes after theirs, and the rotation goes on", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 2);
    const card = toHand(game, "Final Fortune");
    nextTurn(game);
    expect(active(game)).toBe(B);
    game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A);
    cast(game, card);
    // Bob's own end step, which it was cast in, isn't that turn's.
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.delayedTriggers).toHaveLength(0);
    nextTurn(game);
    expect(active(game)).toBe(A);
    expect(game.state.turn.isExtra).toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
    game.advanceUntil((s) => s.players[A].hasLost || s.turn.step === "cleanup");
    expect(game.state.players[A].hasLost).toBe(true);
    expect(game.state.turn.step).toBe("end");
    nextTurn(game);
    expect(active(game)).toBe(C);
  });

  it("Final Fortune skipped: no loss (the rulings)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Final Fortune"));
    game.state.players[A].turnsToSkip = 1;
    nextTurn(game);
    expect(active(game)).toBe(B);
    nextTurn(game);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("Chance for Glory: indestructible for good, for what you control as it resolves", () => {
    const { game } = table();
    lands(game, "Plateau", 3);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Chance for Glory"));
    nextTurn(game);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, theirs);
    expect(zone(game, theirs)).toBe("graveyard");
    game.advanceUntil((s) => s.players[A].hasLost || s.turn.number > 3);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Alchemist's Gambit: damage can't be prevented that turn alone, and it exiles itself", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const gambit = toHand(game, "Alchemist's Gambit");
    cast(game, gambit);
    expect(zone(game, gambit)).toBe("exile");
    expect(game.state.damageUnpreventableThisTurn).toBeUndefined();
    nextTurn(game);
    expect(game.state.turn.isExtra).toBe(true);
    expect(game.state.damageUnpreventableThisTurn).toBe(true);
    expect(game.state.delayedTriggers.map((t) => t.at)).toEqual(["this-turn-end-step"]);
  });

  it("Alchemist's Gambit cleaved loses the bracketed loss and keeps the rest", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 6);
    const gambit = toHand(game, "Alchemist's Gambit");
    cast(game, gambit, { overload: true });
    expect(zone(game, gambit)).toBe("exile");
    nextTurn(game);
    expect(game.state.turn.isExtra).toBe(true);
    expect(game.state.damageUnpreventableThisTurn).toBe(true);
    expect(game.state.delayedTriggers).toHaveLength(0);
    game.advanceUntil((s) => s.turn.number > 3);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.damageUnpreventableThisTurn).toBeUndefined();
  });
});

describe("whether this is an extra turn (the `extra-turn` condition)", () => {
  it("Medomai can attack in a normal turn, and not in an extra one", () => {
    const { game, a } = table();
    const medomai = spawn(game, "Medomai the Ageless");
    attack(game, a, [medomai]);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(16);
    // Her combat damage queued an extra turn.
    expect(game.state.extraTurns).toEqual([A]);
    nextTurn(game);
    expect(game.state.turn.isExtra).toBe(true);
    attack(game, a, [medomai]);
    expect(life(game, B)).toBe(16);
    expect(game.state.extraTurns).toEqual([]);
    // The turn after is an ordinary one again, and it's Bob's; hers is back after.
    nextTurn(game);
    expect(active(game)).toBe(B);
    nextTurn(game);
    expect(active(game)).toBe(A);
    expect(game.state.turn.isExtra).toBe(false);
    attack(game, a, [medomai]);
    expect(life(game, B)).toBe(12);
  });
});
