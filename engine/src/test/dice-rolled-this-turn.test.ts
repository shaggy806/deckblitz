import { describe, expect, it } from "vitest";
import type { EffectSpec } from "../effects.js";
import type { PlayerId } from "../primitives.js";
import { diceRolledThisTurn } from "../random-results.js";
import { A, B, cast, counters, keywords, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

// The dice a player rolled this turn, die by die, read from the journal's
// `rolled` entries (rule 706; `diceRolledThisTurn`): "your third die each
// turn" (the timing wrapper on `rolls-die`), "as long as you've rolled three
// or more dice this turn" and "as long as you've rolled a 6 this turn" (the
// `dice-rolled-this-turn` condition). A d1 always comes up 1, so a test's
// results are known; a modifier makes the other numbers (706.2).

/** `player` rolls `count` d1s as one roll, each die's result 1 + `modifier`. */
function roll(game: Game, count: number, opts: { player?: PlayerId; modifier?: number } = {}): void {
  const effect: EffectSpec = {
    kind: "roll-dice",
    sides: 1,
    count,
    ...(opts.modifier !== undefined ? { modifier: opts.modifier } : {}),
  };
  game.debugApplyEffect(opts.player ?? A, effect);
  settle(game);
}

describe("diceRolledThisTurn", () => {
  it("counts each die of each roll, the player's own, this turn, as its result", () => {
    const { game } = table();
    roll(game, 2);
    roll(game, 1, { modifier: 5 });
    roll(game, 3, { player: B });
    expect(diceRolledThisTurn(game.state, A)).toEqual([1, 1, 6]);
    expect(diceRolledThisTurn(game.state, A, { atLeast: 6, atMost: 6 })).toEqual([6]);
    expect(diceRolledThisTurn(game.state, B)).toHaveLength(3);
    nextTurn(game);
    expect(diceRolledThisTurn(game.state, A)).toEqual([]);
  });
});

describe("Resolute Veggiesaur — whenever you roll your third die each turn", () => {
  it("triggers on the third of three separate rolls, and on no other", () => {
    const { game } = table();
    const id = spawn(game, "Resolute Veggiesaur");
    roll(game, 1);
    roll(game, 1);
    expect(counters(game, id)).toBe(0);
    roll(game, 1);
    expect(counters(game, id)).toBe(1);
    roll(game, 1);
    roll(game, 3);
    expect(counters(game, id)).toBe(1);
  });

  it("triggers once on a roll of several dice that holds the third (its ruling)", () => {
    const { game } = table();
    const id = spawn(game, "Resolute Veggiesaur");
    roll(game, 5);
    expect(counters(game, id)).toBe(1);
  });

  it("triggers on the second roll when the first held two dice", () => {
    const { game } = table();
    const id = spawn(game, "Resolute Veggiesaur");
    roll(game, 2);
    expect(counters(game, id)).toBe(0);
    roll(game, 2);
    expect(counters(game, id)).toBe(1);
  });

  it("counts dice rolled before it was on the battlefield, and only yours", () => {
    const { game } = table();
    roll(game, 2);
    roll(game, 4, { player: B });
    const id = spawn(game, "Resolute Veggiesaur");
    roll(game, 2, { player: B });
    expect(counters(game, id)).toBe(0);
    roll(game, 1);
    expect(counters(game, id)).toBe(1);
  });

  it("counts again from the next turn", () => {
    const { game } = table();
    const id = spawn(game, "Resolute Veggiesaur");
    roll(game, 3);
    expect(counters(game, id)).toBe(1);
    nextTurn(game);
    roll(game, 2);
    expect(counters(game, id)).toBe(1);
    roll(game, 1);
    expect(counters(game, id)).toBe(2);
  });
});

describe("The Space Family Goblinson — three or more dice this turn", () => {
  it("has trample once you've rolled three dice, counting each die of a roll", () => {
    const { game } = table();
    const id = spawn(game, "The Space Family Goblinson");
    expect(keywords(game, id).has("trample")).toBe(false);
    roll(game, 2);
    // A counter per die rolled.
    expect(counters(game, id)).toBe(2);
    expect(keywords(game, id).has("trample")).toBe(false);
    roll(game, 1);
    expect(counters(game, id)).toBe(3);
    expect(keywords(game, id).has("trample")).toBe(true);
    nextTurn(game);
    expect(keywords(game, id).has("trample")).toBe(false);
  });

  it("an opponent's dice don't count", () => {
    const { game } = table();
    const id = spawn(game, "The Space Family Goblinson");
    roll(game, 3, { player: B });
    expect(counters(game, id)).toBe(0);
    expect(keywords(game, id).has("trample")).toBe(false);
  });
});

describe("Eelectrocute — cast from your graveyard as long as you've rolled a 6 this turn", () => {
  const castable = (game: Game, id: string): boolean =>
    game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === id);

  it("is castable from the graveyard only after a 6, and is exiled after", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const id = toGraveyard(game, "Eelectrocute");
    expect(castable(game, id)).toBe(false);
    roll(game, 3);
    expect(castable(game, id)).toBe(false);
    // A 6 with its modifier is a 6 (706.2).
    roll(game, 1, { modifier: 5 });
    expect(castable(game, id)).toBe(true);
    cast(game, id, { via: "graveyard-permission", targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, id)).toBe("exile");
  });

  it("an opponent's 6 doesn't let you, and a 6 last turn no longer does", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const id = toGraveyard(game, "Eelectrocute");
    roll(game, 1, { player: B, modifier: 5 });
    expect(castable(game, id)).toBe(false);
    roll(game, 1, { modifier: 5 });
    expect(castable(game, id)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(castable(game, id)).toBe(false);
  });

  it("cast from the hand, it goes to the graveyard as ever", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const id = toHand(game, "Eelectrocute");
    cast(game, id, { targets: [ref(B)] });
    expect(zone(game, id)).toBe("graveyard");
  });
});
