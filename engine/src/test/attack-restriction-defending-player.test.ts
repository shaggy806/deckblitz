/**
 * Combat restrictions that read another player: "can't attack unless
 * defending player controls an Island" (`cantAttackUnlessDefender` — Sea
 * Serpent), "can't attack if defending player controls an untapped creature
 * with power 3 or greater" (`cantAttackIfDefender` — Orgg), and "can't block
 * unless you control more creatures than attacking player"
 * (`cantBlockUnlessAttacker` — Mogg Toady). Each is asked of the player that
 * one attack or block involves (rules 506.2, 508.1c, 509.1b), so at a table
 * of four the same creature may attack one opponent and not another.
 */

import { describe, expect, it } from "vitest";

import { defendersForAttacker } from "../combat/eligibility.js";
import { A, B, C, D, blockOffer, lands, spawn, table } from "./harness.js";

describe("attack restrictions on the defending player", () => {
  it("Sea Serpent may attack only an opponent who controls an Island", () => {
    const { game } = table({ players: 4 });
    const serpent = spawn(game, "Sea Serpent", A);
    lands(game, "Island", 1, A);
    lands(game, "Island", 1, C);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([C]);
    lands(game, "Island", 1, D);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([C, D]);
  });

  it("…and a planeswalker of such an opponent: its defending player is the controller", () => {
    const { game } = table();
    const serpent = spawn(game, "Sea Serpent", A);
    lands(game, "Island", 1, A);
    const walker = spawn(game, "Jace Beleren", B);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([]);
    lands(game, "Island", 1, B);
    expect(defendersForAttacker(game.state, game.registry, A, serpent)).toEqual([B, walker]);
  });

  it("Orgg can't attack a player with an untapped creature of power 3 or more", () => {
    const { game } = table({ players: 3 });
    const orgg = spawn(game, "Orgg", A);
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", C, { tapped: true });
    spawn(game, "Grizzly Bears", C);
    expect(defendersForAttacker(game.state, game.registry, A, orgg)).toEqual([C]);
  });

  it("Mogg Toady attacks and blocks only while its side has more creatures", () => {
    const { game, a } = table();
    const toady = spawn(game, "Mogg Toady", A);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(defendersForAttacker(game.state, game.registry, A, toady)).toEqual([]);
    spawn(game, "Grizzly Bears", A);
    expect(defendersForAttacker(game.state, game.registry, A, toady)).toEqual([B]);

    // Bob's Toady: two creatures to Alice's three — it can't block her Bears.
    const bobToady = spawn(game, "Mogg Toady", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker]);
    const canBlock = (blocker: string) => offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bobToady)).toEqual([]);
    expect(canBlock(bears)).toEqual([attacker]);
  });
});
