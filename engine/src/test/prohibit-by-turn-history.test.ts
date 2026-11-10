/**
 * A "can't" that binds each player by what that player did this turn:
 * `CardFilter.controllerThisTurn` (the creatures of a player who did it) and a
 * static prohibition's `{ who, thisTurn }` (`PlayersWhoDid`), both a
 * `TurnStat` read for that one player. Angelic Arbiter is the card.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, destroy, lands, nextTurn, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const canCast = (game: Game, card: ObjectId, player: PlayerId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

/** The creatures `player` may attack with this turn: none when they aren't
 * even asked. */
function eligible(game: Game, player: PlayerId): readonly ObjectId[] {
  const turn = game.state.turn.number;
  game.advanceUntil(
    (s) =>
      (s.awaiting?.kind === "attackers" && s.awaiting.player === player) ||
      s.turn.number > turn ||
      s.turn.step === "postcombat-main",
  );
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  return offer?.eligible ?? [];
}

describe("each opponent who cast a spell this turn can't attack with creatures", () => {
  it("binds the opponent who cast, from the cast on", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Angelic Arbiter", A);
    spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    cast(game, toHand(game, "Ornithopter", B), { player: B });
    expect(eligible(game, B)).toEqual([]);
  });

  it("leaves an opponent who cast nothing free to attack, whatever another opponent cast", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Angelic Arbiter", A);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, C);
    const shock = toHand(game, "Shock", C);
    nextTurn(game, "upkeep");
    game.advanceUntil((s) => s.priority.holder === C);
    cast(game, shock, { player: C, targets: [ref(A)] });
    expect(zone(game, shock)).toBe("graveyard");
    // Playing a land isn't casting a spell.
    toStep(game, "precombat-main", B);
    game.dispatch({ type: "play-land", player: B, card: toHand(game, "Forest", B) });
    expect(eligible(game, B)).toEqual([bear]);
  });

  it.each([false, true])("counts a spell cast before the Arbiter arrived (it then leaves: %s)", (leaves) => {
    const { game } = table({ players: 3 });
    const bear = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    cast(game, toHand(game, "Ornithopter", B), { player: B });
    const arbiter = spawn(game, "Angelic Arbiter", A);
    if (leaves) destroy(game, arbiter);
    expect(eligible(game, B)).toEqual(leaves ? [bear] : []);
  });

  it("does nothing to its controller", () => {
    const { game, a } = table();
    spawn(game, "Angelic Arbiter", A);
    const bear = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Ornithopter", A));
    expect(eligible(game, A)).toContain(bear);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "postcombat-main", A);
    expect(canCast(game, toHand(game, "Ornithopter", A), A)).toBe(true);
  });
});

describe("each opponent who attacked with a creature this turn can't cast spells", () => {
  function afterBobAttacks(): { game: Game; arbiter: ObjectId; thopter: ObjectId; shock: ObjectId } {
    const { game, b } = table({ players: 3 });
    const arbiter = spawn(game, "Angelic Arbiter", A);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, C);
    const shock = toHand(game, "Shock", C);
    const thopter = toHand(game, "Ornithopter", B);
    nextTurn(game);
    expect(canCast(game, thopter, B)).toBe(true);
    b.declareAttackersFn = () => [{ attacker: bear, defender: C }];
    toStep(game, "postcombat-main", B);
    return { game, arbiter, thopter, shock };
  }

  it("binds the opponent who attacked and not another opponent", () => {
    const { game, thopter, shock } = afterBobAttacks();
    expect(canCast(game, thopter, B)).toBe(false);
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.priority.holder === C);
    expect(canCast(game, shock, C)).toBe(true);
  });

  it("ends when the Arbiter leaves", () => {
    const { game, arbiter, thopter } = afterBobAttacks();
    destroy(game, arbiter);
    expect(canCast(game, thopter, B)).toBe(true);
  });

  it("ends with the turn", () => {
    const { game, thopter } = afterBobAttacks();
    // Bob's next turn: he hasn't attacked yet.
    toStep(game, "precombat-main", B);
    expect(canCast(game, thopter, B)).toBe(true);
  });
});
