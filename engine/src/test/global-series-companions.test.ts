import { describe, expect, it } from "vitest";
import { A, B, activate, cast, keywords, lands, life, ref, spawn, table, toHand } from "./harness.js";

// Global Series: Jiang Yanggu & Mu Yanling's creatures that read their
// planeswalker, and Storm of Steel's "each of one or two targets".

describe("Sacred White Deer — activate only if you control a Yanggu planeswalker", () => {
  it("is refused without one, and gains 4 life with one", () => {
    const { game } = table();
    const deer = spawn(game, "Sacred White Deer");
    lands(game, "Forest", 4);
    expect(() => activate(game, deer)).toThrow(/Yanggu|condition|only|activate/i);
    spawn(game, "Jiang Yanggu");
    const before = life(game);
    activate(game, deer);
    expect(life(game)).toBe(before + 4);
  });

  it("an opponent's Yanggu doesn't count", () => {
    const { game } = table();
    const deer = spawn(game, "Sacred White Deer");
    lands(game, "Forest", 4);
    spawn(game, "Jiang Yanggu", B);
    expect(() => activate(game, deer)).toThrow(/Yanggu|condition|only|activate/i);
  });
});

describe("Moon-Eating Dog — flying while you control a Yanling planeswalker", () => {
  it("has flying only with your Yanling", () => {
    const { game } = table();
    const dog = spawn(game, "Moon-Eating Dog");
    expect(keywords(game, dog).has("flying")).toBe(false);
    spawn(game, "Mu Yanling", B);
    expect(keywords(game, dog).has("flying")).toBe(false);
    spawn(game, "Mu Yanling");
    expect(keywords(game, dog).has("flying")).toBe(true);
  });
});

describe("Storm of Steel — 2 damage to each of one or two targets", () => {
  it("hits two different targets, or just one", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const [mine, theirs] = [life(game, A), life(game, B)];
    cast(game, toHand(game, "Storm of Steel"), { targets: [ref(bears), ref(B)] });
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(life(game, B)).toBe(theirs - 2);
    cast(game, toHand(game, "Storm of Steel"), { targets: [ref(B), null] });
    expect(life(game, B)).toBe(theirs - 4);
    expect(life(game, A)).toBe(mine);
  });

  it("can't take the same target twice", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    expect(() => cast(game, toHand(game, "Storm of Steel"), { targets: [ref(B), ref(B)] })).toThrow(/target/i);
  });
});
