/**
 * "For each opponent, create two 3/3 … tokens with flying that attack that
 * opponent this turn if able. They gain haste until end of turn" (Furygale
 * Flocking): `create-token`'s `attacksThisTurn`, a requirement made with the
 * tokens (rule 508.1d), aimed at one player — not a planeswalker they control
 * (the rulings) — for the rest of the turn.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, keywords, lands, named, spawn, table, toGraveyard, toHand } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

const elementals = (game: Game): ObjectId[] => named(game, "Elemental Token (3/3 Blue-Red Flying)", A);

describe("Furygale Flocking — tokens that attack that opponent this turn if able", () => {
  it("makes two hasty flyers per opponent, each bound to attack its own opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 10);
    const flocking = toHand(game, "Furygale Flocking");
    // A planeswalker of bob's is no way to obey (the rulings).
    spawn(game, "Jace Beleren", B);
    cast(game, flocking);
    const tokens = elementals(game);
    expect(tokens.length).toBe(4);
    for (const id of tokens) expect(keywords(game, id).has("haste")).toBe(true);
    const offer = attackOffer(game, A);
    expect([...offer.mustAttack].sort()).toEqual([...tokens].sort());
    const aims = tokens.map((id) => offer.defendersFor[id]);
    expect(aims.filter((d) => d.length === 1 && d[0] === B).length).toBe(2);
    expect(aims.filter((d) => d.length === 1 && d[0] === C).length).toBe(2);
  });

  it("costs {1} less for each instant and sorcery card in your graveyard", () => {
    const { game } = table({ players: 2 });
    lands(game, "Mountain", 8);
    toGraveyard(game, "Divination");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    const flocking = toHand(game, "Furygale Flocking");
    cast(game, flocking);
    expect(elementals(game).length).toBe(2);
  });

  it("binds only this turn", () => {
    const { game } = table({ players: 2 });
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "Furygale Flocking"));
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([]);
  });
});
