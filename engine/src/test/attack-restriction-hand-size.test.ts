/**
 * A static combat record whose scope compares with an amount read from its
 * source's side — Ensnaring Bridge's "creatures with power greater than the
 * number of cards in your hand can't attack" (rule 508.1c). The scope is read
 * as attackers are declared, outside the layer fold (`recordsOn`), with the
 * source's `sourceAmount`: its controller's hand as it is then, whoever is
 * attacking. Once a creature has attacked, a smaller hand doesn't remove it
 * from combat (the card's ruling).
 */
import { describe, expect, it } from "vitest";

import { defendersForAttacker } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, hand, life, spawn, table, toHand, toStep } from "./harness.js";

const handSize = (game: Game, player: PlayerId, n: number): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "graveyard");
  for (let i = 0; i < n; i += 1) toHand(game, "Wastes", player);
};

describe("Ensnaring Bridge: power against its controller's hand", () => {
  it("only creatures with power at most your hand size may attack, either side's", () => {
    const { game } = table();
    spawn(game, "Ensnaring Bridge", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const theirBears = spawn(game, "Grizzly Bears", B);
    handSize(game, A, 1);
    // Bob's seven-card hand doesn't help him: "your" is the Bridge's controller.
    handSize(game, B, 7);
    expect(defendersForAttacker(game.state, game.registry, A, elves)).toEqual([B]);
    expect(defendersForAttacker(game.state, game.registry, A, bears)).toEqual([]);
    expect(defendersForAttacker(game.state, game.registry, B, theirBears)).toEqual([]);
    handSize(game, A, 2);
    expect(defendersForAttacker(game.state, game.registry, A, bears)).toEqual([B]);
    expect(defendersForAttacker(game.state, game.registry, B, theirBears)).toEqual([A]);
  });

  it("with no cards in hand, only power 0 or less", () => {
    const { game } = table();
    spawn(game, "Ensnaring Bridge", A);
    const wall = spawn(game, "Ornithopter", A);
    const elves = spawn(game, "Llanowar Elves", A);
    handSize(game, A, 0);
    expect(defendersForAttacker(game.state, game.registry, A, wall)).toEqual([B]);
    expect(defendersForAttacker(game.state, game.registry, A, elves)).toEqual([]);
  });

  it("a creature that attacked stays in combat when the hand shrinks", () => {
    const { game, a } = table();
    spawn(game, "Ensnaring Bridge", A);
    const bears = spawn(game, "Grizzly Bears", A);
    handSize(game, A, 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].tapped).toBe(true);
    handSize(game, A, 0);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
  });
});
