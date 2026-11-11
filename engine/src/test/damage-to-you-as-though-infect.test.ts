/**
 * "As long as you have 0 or less life, all damage is dealt to you as though
 * its source had infect" — `damageAsThoughSourceHad`'s `to: "you"` (rules
 * 120.3b, 702.90b): poison counters in place of loss of life, for damage
 * dealt to that static's controller alone. Phyrexian Unlife, beside its "you
 * don't lose the game for having 0 or less life" (704.5a).
 */
import { describe, expect, it } from "vitest";

import { A, attack, B, counters, destroy, life, nextTurn, ref, spawn, table, toStep } from "./harness.js";

const poison = (game: ReturnType<typeof table>["game"], player = A): number => game.state.players[player].counters.poison ?? 0;

describe("Phyrexian Unlife", () => {
  it("the damage that takes you to 0 or less is loss of life; damage after it is poison", () => {
    const { game } = table();
    spawn(game, "Phyrexian Unlife");
    game.state.players[A].life = 3;
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 5 }, [ref(A)]);
    toStep(game, "begin-combat"); // state-based actions looked at
    expect(life(game)).toBe(-2);
    expect(poison(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);

    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 2 }, [ref(A)]);
    expect(life(game)).toBe(-2);
    expect(poison(game)).toBe(2);
    // Loss of life that isn't damage is still loss of life.
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "you" }, []);
    expect(life(game)).toBe(-3);
    expect(poison(game)).toBe(2);
    toStep(game, "postcombat-main");
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("is only damage dealt to you: an opponent's and a creature's are dealt as usual", () => {
    const { game } = table();
    spawn(game, "Phyrexian Unlife");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    game.state.players[A].life = 0;
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 3 }, [ref(B)]);
    expect(life(game, B)).toBe(17);
    expect(poison(game, B)).toBe(0);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 1 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [ref(wall)]);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(counters(game, bears, "-1/-1")).toBe(0);
    expect(game.state.objects[wall].damageMarked).toBe(1);
  });

  it("combat damage dealt at once is read as you stood before it (rule 510.2)", () => {
    const { game, b } = table();
    spawn(game, "Phyrexian Unlife");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    game.state.players[A].life = 1;
    attack(game, b, [one, two], A);
    // 2 + 3, all of it loss of life: you had 1 life as it was dealt.
    expect(life(game)).toBe(-4);
    expect(poison(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("ten poison counters still lose the game, and so does losing the enchantment", () => {
    const { game } = table();
    const unlife = spawn(game, "Phyrexian Unlife");
    game.state.players[A].life = -1;
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 9 }, [ref(A)]);
    toStep(game, "begin-combat");
    expect(poison(game)).toBe(9);
    expect(game.state.players[A].hasLost).toBe(false);

    const second = table();
    const theirs = spawn(second.game, "Phyrexian Unlife");
    second.game.state.players[A].life = -1;
    second.game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 10 }, [ref(A)]);
    nextTurn(second.game);
    expect(second.game.state.players[A].hasLost).toBe(true);
    expect(theirs).toBeDefined();

    destroy(game, unlife);
    nextTurn(game);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("without it, damage at 0 or less life is loss of life", () => {
    const { game } = table();
    spawn(game, "Lich's Tomb"); // alive at 0, but no infect clause
    game.state.players[A].life = 0;
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 2 }, [ref(A)]);
    expect(poison(game)).toBe(0);
    expect(life(game)).toBe(-2);
  });
});
