/**
 * Goad beside an attack tax (rules 701.15b, 508.1d): "attacks a player other
 * than its goader if able" can't oblige a player to pay Ghostly Prison's {2},
 * and "attacks each combat if able" is still obeyed at the goader. So with the
 * only other player behind a tax, the goaded creature may be sent at its
 * goader, and unpaid it must be: it can't stay home.
 */

import { describe, expect, it } from "vitest";

import type { AttackerDeclaration, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, spawn, table } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** Three players at alice's declaration: her Bears goaded by carol, bob behind
 * Ghostly Prison, alice with `lands` Wastes. */
const board = (lands: number): { game: Game; bears: ObjectId; offer: Offer } => {
  const { game } = table({ players: 3 });
  spawn(game, "Ghostly Prison", B);
  for (let i = 0; i < lands; i += 1) spawn(game, "Wastes");
  const bears = spawn(game, "Grizzly Bears");
  game.state.objects[bears].goadedBy = [C];
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(A).find((o): o is Offer => o.kind === "declare-attackers")!;
  return { game, bears, offer };
};

const declared = (game: Game, attackers: readonly AttackerDeclaration[]): string | null =>
  game.canDispatch({ type: "declare-attackers", player: A, attackers });

const at = (attacker: ObjectId, defender: PlayerId): AttackerDeclaration[] => [{ attacker, defender }];

describe("a goaded creature whose only other player is behind an attack tax", () => {
  it("may be sent at its goader, and must attack", () => {
    const { game, bears, offer } = board(0);
    expect(offer.defendersFor[bears]).toEqual(expect.arrayContaining([B, C]));
    expect(offer.mustAttack).toContain(bears);
    // Home is no longer a legal place for it.
    expect(declared(game, [])).not.toBeNull();
    // At the goader, for nothing.
    expect(declared(game, at(bears, C))).toBeNull();
    // At the taxed player, only by paying, which it can't.
    expect(declared(game, at(bears, B))).not.toBeNull();
  });

  it("may still pay to attack the other player", () => {
    const { game, bears } = board(2);
    expect(declared(game, at(bears, B))).toBeNull();
    expect(declared(game, at(bears, C))).toBeNull();
    expect(declared(game, [])).not.toBeNull();
  });

  it("is still kept off its goader by a player it costs nothing to attack", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].goadedBy = [C];
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((o): o is Offer => o.kind === "declare-attackers")!;
    expect(offer.defendersFor[bears]).toEqual([B]);
    expect(declared(game, at(bears, C))).not.toBeNull();
  });
});
