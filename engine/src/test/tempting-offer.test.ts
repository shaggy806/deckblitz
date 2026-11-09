/**
 * Tempting offer — an `each-player-may` asked of each opponent in turn order
 * (rule 101.4), the offer theirs to do, then `ifDid` once for you per
 * opponent who took it. Tempt with Bunnies: "Draw a card and create a 1/1
 * white Rabbit creature token. Then each opponent may draw a card and create
 * a 1/1 white Rabbit creature token. For each opponent who does, you draw a
 * card and you create a 1/1 white Rabbit creature token."
 */
import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, hand, lands, pickModes, spawn, table, toHand, tokensNamed } from "./harness.js";

describe("Tempt with Bunnies", () => {
  it("at four players: two take it, one doesn't — you get a card and a Rabbit, plus one each per taker", () => {
    const t = table({ players: 4 });
    const { game } = t;
    lands(game, "Plains", 3);
    const asked: string[] = [];
    t.b.chooseModesFn = () => (asked.push("bob"), [0]);
    t.c.chooseModesFn = () => (asked.push("carol"), []);
    t.d.chooseModesFn = () => (asked.push("dave"), [0]);
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length, d: hand(game, D).length };
    cast(game, toHand(game, "Tempt with Bunnies"));

    // Asked in turn order, each once.
    expect(asked).toEqual(["bob", "carol", "dave"]);
    // 1 + 2 for alice (the spell came to her hand and left it).
    expect(hand(game, A).length).toBe(before.a + 3);
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(3);
    expect(hand(game, B).length).toBe(before.b + 1);
    expect(tokensNamed(game, "Rabbit Token", B)).toBe(1);
    expect(hand(game, C).length).toBe(before.c);
    expect(tokensNamed(game, "Rabbit Token", C)).toBe(0);
    expect(hand(game, D).length).toBe(before.d + 1);
    expect(tokensNamed(game, "Rabbit Token", D)).toBe(1);
  });

  it("each answers before anything is done (rule 101.4): a later player sees no earlier card or token", () => {
    const t = table({ players: 4 });
    const { game } = t;
    lands(game, "Plains", 3);
    const bobsHand = hand(game, B).length;
    const seen: { hand: number; rabbits: number }[] = [];
    const watch = (): void => {
      seen.push({ hand: hand(game, B).length, rabbits: tokensNamed(game, "Rabbit Token", B) });
    };
    t.b.chooseModesFn = () => (watch(), [0]);
    t.c.chooseModesFn = () => (watch(), [0]);
    t.d.chooseModesFn = () => (watch(), []);
    cast(game, toHand(game, "Tempt with Bunnies"));
    expect(seen).toEqual([
      { hand: bobsHand, rabbits: 0 },
      { hand: bobsHand, rabbits: 0 },
      { hand: bobsHand, rabbits: 0 },
    ]);
    expect(hand(game, B).length).toBe(bobsHand + 1);
    expect(tokensNamed(game, "Rabbit Token", B)).toBe(1);
  });

  it("a question raised by one player's token doesn't lose the next player's", () => {
    const t = table({ players: 3 });
    const { game } = t;
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = game.debugSpawn("Moonlit Meditation", B, "battlefield");
    game.state.objects[aura].attachedTo = bears;
    let bobAsked = 0;
    t.b.chooseModesFn = () => (bobAsked += 1) === 1 ? [0] : [1];
    t.c.chooseModesFn = () => [0];
    const carols = hand(game, C).length;
    cast(game, toHand(game, "Tempt with Bunnies"));
    expect(bobAsked).toBe(2);
    expect(tokensNamed(game, "Rabbit Token", B)).toBe(0);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(1);
    expect(tokensNamed(game, "Rabbit Token", C)).toBe(1);
    expect(hand(game, C).length).toBe(carols + 1);
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(3);
  });

  it("nobody takes it: one card and one Rabbit", () => {
    const t = table();
    const { game } = t;
    lands(game, "Plains", 3);
    pickModes(t.b);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Tempt with Bunnies"));
    expect(hand(game, A).length).toBe(before + 1);
    expect(tokensNamed(game, "Rabbit Token", A)).toBe(1);
    expect(tokensNamed(game, "Rabbit Token", B)).toBe(0);
  });
});
