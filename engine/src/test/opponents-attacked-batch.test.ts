import { describe, expect, it } from "vitest";
import { A, B, C, attack, destroy, enter, hand, pickTargets, pt, spawn, table, toHand, toStep, tokensNamed } from "./harness.js";

// "Whenever one or more of your opponents are attacked" (rule 508.3b): once
// for a declaration with a creature attacking one or more of your opponents,
// whoever attacks — Jolene, the Plunder Queen's `attack-with` shape with
// `attackingOpponent`. Party Dude's level 3.

const atLevel3 = (players: 2 | 3 = 3) => {
  const t = table({ players });
  const dude = spawn(t.game, "Party Dude");
  t.game.state.objects[dude].classLevel = 3;
  for (let i = 0; i < 3; i += 1) toHand(t.game, "Wastes");
  return { ...t, dude };
};

describe("Party Dude — one or more of your opponents are attacked", () => {
  it("fires once when you attack two opponents, pumping one attacker by your hand size", () => {
    const { game, a } = atLevel3();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: C },
    ];
    toStep(game, "postcombat-main", A);
    const x = hand(game).length;
    expect(x).toBeGreaterThan(0);
    expect(pt(game, bears)).toEqual({ power: 2 + x, toughness: 2 + x });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
  });

  it("fires when an opponent attacks another of your opponents", () => {
    const { game, a, b } = atLevel3();
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    pickTargets(a, theirs);
    attack(game, b, [theirs], C);
    // X is the number of cards in Party Dude's controller's hand.
    const x = hand(game, A).length;
    expect(pt(game, theirs)).toEqual({ power: 2 + x, toughness: 2 + x });
  });

  it("doesn't fire when only you are attacked", () => {
    const { game, a, b } = atLevel3();
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    pickTargets(a, theirs);
    attack(game, b, [theirs], A);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("doesn't fire for a planeswalker an opponent controls", () => {
    const { game, a } = atLevel3(2);
    const walker = spawn(game, "Jiang Yanggu", B);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [bears], walker);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Party Dude — levels 1 and 2", () => {
  it("each player creates a Food as it enters", () => {
    const { game } = table({ players: 3 });
    enter(game, "Party Dude");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", B)).toBe(1);
    expect(tokensNamed(game, "Food Token", C)).toBe(1);
  });

  it("at level 2, draws when an opponent's artifact goes to the graveyard, not yours", () => {
    const { game } = table();
    const dude = spawn(game, "Party Dude");
    game.state.objects[dude].classLevel = 2;
    const theirs = spawn(game, "Sol Ring", B);
    const mine = spawn(game, "Sol Ring");
    const before = hand(game).length;
    destroy(game, theirs);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, mine);
    expect(hand(game).length).toBe(before + 1);
  });
});
