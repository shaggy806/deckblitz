/**
 * "If that player has more … than each other player", three times over on one
 * combat-damage trigger: each a read of the player dealt the damage, as its turn
 * in the sequence comes. Every player besides that one is an opponent of theirs
 * (rule 102.3), so the attacker's own hand, lands and life count too.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, attack, hand, lands, life, spawn, table, toHand, tokensNamed } from "./harness.js";

const TREASURE = "Treasure Token";

describe("Battle Angels of Tyr", () => {
  it("does nothing when that player leads in nothing", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    const before = hand(game).length;
    attack(game, a, [angels]);
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before);
    expect(tokensNamed(game, TREASURE, A)).toBe(0);
    expect(life(game)).toBe(20);
  });

  it("each clause reads on its own: the hand draws, the lands make a Treasure, the life gains nothing", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    // Alice has drawn for the turn: bob needs two more to pass her.
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    lands(game, "Wastes", 1, B);
    const before = hand(game).length;
    attack(game, a, [angels]);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, TREASURE, A)).toBe(1);
    expect(life(game)).toBe(20);
  });

  it("reads life after the damage: 23 less 4 is no longer the most", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    game.state.players[B].life = 23;
    attack(game, a, [angels]);
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(20);
  });

  it("gains 3 while that player still has the most life after the hit", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    game.state.players[B].life = 30;
    attack(game, a, [angels]);
    expect(life(game, B)).toBe(26);
    expect(life(game)).toBe(23);
  });

  it("a tie for the most isn't more; the attacker's own count is one to beat", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    // Lands: bob level with carol, both ahead of alice. Hand: bob ahead of
    // carol, level with alice (who has drawn for the turn).
    lands(game, "Wastes", 2, B);
    lands(game, "Wastes", 2, C);
    toHand(game, "Wastes", B);
    const before = hand(game).length;
    expect(hand(game, B).length).toBe(before);
    attack(game, a, [angels]);
    expect(tokensNamed(game, TREASURE, A)).toBe(0);
    expect(hand(game).length).toBe(before);
  });

  it("myriad's copy reads the player it hit, and its controller makes the Treasure", () => {
    const { game, a } = table({ players: 3 });
    const angels = spawn(game, "Battle Angels of Tyr");
    // Carol has the most lands, bob doesn't; the copy attacking carol finds them.
    lands(game, "Wastes", 1, C);
    a.chooseModesFn = () => [0];
    attack(game, a, [angels], B);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(16);
    expect(tokensNamed(game, TREASURE, A)).toBe(1);
  });

  it("in a two-player game there's nobody to copy for, and the trigger still reads", () => {
    const { game, a } = table({ players: 2 });
    const angels = spawn(game, "Battle Angels of Tyr");
    lands(game, "Wastes", 1, B);
    attack(game, a, [angels]);
    expect(tokensNamed(game, TREASURE, A)).toBe(1);
  });
});
