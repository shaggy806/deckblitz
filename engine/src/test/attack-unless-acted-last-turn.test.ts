/**
 * Arboria: "Creatures can't attack a player unless that player cast a spell
 * or put a nontoken permanent onto the battlefield during their last turn" —
 * a `cant-attack` aimed at the players who fail a `PlayerTest` (rule 508.1c),
 * read through the journal's `spell-cast` entries (the `"spells-cast"` word)
 * and its `entered` ones, each in that player's own last turn.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, D, cast, nextTurn, spawn, table, toHand } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

/** The next turn's precombat main, with its active player's priority. */
function toNextMain(game: Game): PlayerId {
  nextTurn(game);
  return activePlayerOf(game.state);
}

describe("Arboria", () => {
  it("lets creatures attack only the players who cast a spell or put a nontoken permanent onto the battlefield in their last turn", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Arboria");
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Bitterblossom", D);
    const jace = spawn(game, "Jace Beleren", D);
    game.state.objects[jace].counters = { loyalty: 3 };
    // Bob casts a spell (no permanent).
    expect(toNextMain(game)).toBe(B);
    spawn(game, "Island", B);
    const opt = toHand(game, "Opt", B);
    cast(game, opt, { player: B });
    // Carol plays a land (no spell).
    expect(toNextMain(game)).toBe(C);
    const land = toHand(game, "Forest", C);
    game.dispatch({ type: "play-land", player: C, card: land });
    // Dave gets only a token, from his Bitterblossom in his upkeep.
    expect(toNextMain(game)).toBe(D);
    const turn = game.state.turn.number;
    expect(game.state.journal?.entries.some((e) => e.kind === "entered" && e.player === D && e.turn === turn && e.was?.isToken === true)).toBe(true);
    expect(toNextMain(game)).toBe(A);
    const offer = attackOffer(game, A);
    expect([...offer.defendersFor[bear]].sort()).toEqual([B, C, jace].sort());
  });

  it("counts only their own last turn, not one of someone else's", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Arboria");
    const bear = spawn(game, "Grizzly Bears");
    // Bob casts a spell in alice's turn: not during his last turn.
    spawn(game, "Island", B);
    const opt = toHand(game, "Opt", B);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.priority.holder === B);
    cast(game, opt, { player: B });
    expect(game.state.journal?.entries.some((e) => e.kind === "spell-cast" && e.player === B)).toBe(true);
    expect(toNextMain(game)).toBe(B);
    expect(toNextMain(game)).toBe(C);
    expect(toNextMain(game)).toBe(A);
    // Nobody can be attacked, so alice isn't asked to attack at all.
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.turn.step === "postcombat-main");
    expect(game.state.awaiting?.kind).not.toBe("attackers");
    expect(game.state.objects[bear].attacking ?? null).toBeNull();
  });
});
