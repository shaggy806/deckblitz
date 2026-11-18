/**
 * "Whenever this creature deals combat damage to a player, choose one — •
 * That player returns a permanent they control to its owner's hand. • That
 * player discards a card." (Blizzard Specter): a modal trigger whose mode is
 * chosen as it's put on the stack (rule 700.2b), and a `choose-permanents`
 * the damaged player answers (`chooser: "trigger-player"`) — not a target,
 * so a permanent with hexproof may be chosen (the ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, hand, named, pickModes, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

describe("Blizzard Specter", () => {
  it("the first mode: the damaged player returns a permanent of their choice, hexproof or not", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Blizzard Specter");
    spawn(game, "Grizzly Bears", B);
    const hexproof = spawn(game, "Gladecover Scout", B);
    pickModes(a, 0);
    const seen = pickPermanents(b, hexproof);
    attack(game, a, [specter]);
    expect(seen.offered).toContain(hexproof);
    expect(seen.offered).toHaveLength(2);
    expect(hand(game, B)).toContain(hexproof);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(game.state.players[B].life).toBe(18);
  });

  it("a permanent the damaged player controls but doesn't own goes to its owner's hand", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Blizzard Specter");
    const borrowed = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(borrowed)]);
    pickModes(a, 0);
    pickPermanents(b, borrowed);
    attack(game, a, [specter]);
    expect(hand(game, A)).toContain(borrowed);
  });

  it("the second mode: the damaged player discards a card", () => {
    const { game, a, b } = table();
    const specter = spawn(game, "Blizzard Specter");
    const kept = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Shock", B);
    pickModes(a, 1);
    b.chooseDiscardsFn = () => [card];
    const before = hand(game, B).length;
    attack(game, a, [specter]);
    expect(hand(game, B)).toHaveLength(before - 1);
    expect(game.state.objects[card].zone).toBe("graveyard");
    expect(game.state.objects[kept].zone).toBe("battlefield");
  });
});
