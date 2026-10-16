/**
 * Set walk batch 90, part f (2026-10-16): the rad counter and squad cards of Fallout (PIP), and older cards that waited on them.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, attack, cast, counters, hand, lands, life, named, nextTurn, pt, settle, spawn, table, toHand } from "./harness.js";

const rad = (game: Game, player: PlayerId = A): number => game.state.players[player].counters.rad ?? 0;
const giveRad = (game: Game, n: number, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "add-player-counters", counter: "rad", amount: n }, []);
  settle(game);
};
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);

describe("Vexing Radgull", () => {
  it("a player with no rad counters gets two", () => {
    const { game, a } = table();
    const gull = spawn(game, "Vexing Radgull");
    attack(game, a, [gull]);
    expect(life(game, B)).toBe(19);
    expect(rad(game, B)).toBe(2);
  });

  it("a player who has one instead lets you proliferate — and gets no two of their own", () => {
    const { game, a } = table();
    giveRad(game, 1, B);
    const gull = spawn(game, "Vexing Radgull");
    let asked = 0;
    a.chooseProliferateFn = (_view, eligible) => {
      asked += 1;
      return eligible.filter((t) => t.kind === "player" && t.player === B);
    };
    attack(game, a, [gull]);
    expect(asked).toBe(1);
    expect(rad(game, B)).toBe(2);
  });
});

describe("Vault 12: The Necropolis", () => {
  it("I: each player gets three rad; II: X Zombie Mutants for every rad counter among players", () => {
    const { game } = table(); // libraries of Wastes: the rad mill never takes a counter away
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Vault 12: The Necropolis"));
    expect(rad(game, A)).toBe(3);
    expect(rad(game, B)).toBe(3);
    giveRad(game, 1, B);
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's: chapter II
    settle(game);
    expect(tokensOf(game, "Zombie Mutant Token")).toHaveLength(7);
    expect(tokensOf(game, "Zombie Mutant Token", B)).toHaveLength(0);
  });

  it("III: two +1/+1 counters on each Zombie or Mutant you control — once for one that's both", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const saga = toHand(game, "Vault 12: The Necropolis");
    cast(game, saga);
    nextTurn(game);
    nextTurn(game); // chapter II: six tokens
    settle(game);
    const zombie = spawn(game, "Gravedigger"); // a Zombie, not a Mutant
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Gravedigger", B);
    nextTurn(game);
    nextTurn(game); // chapter III
    settle(game);
    const tokens = tokensOf(game, "Zombie Mutant Token");
    expect(tokens).toHaveLength(6);
    for (const token of tokens) expect(counters(game, token)).toBe(2);
    expect(counters(game, zombie)).toBe(2);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(game.state.objects[saga].zone).toBe("graveyard");
  });
});

describe("Galadhrim Brigade", () => {
  it("squad twice: three Brigades, each pumping the other Elves", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Galadhrim Brigade"), { kicked: true, kickCount: 2 });
    const brigades = named(game, "Galadhrim Brigade", A);
    expect(brigades).toHaveLength(3);
    expect(brigades.filter((id) => game.state.objects[id].isToken)).toHaveLength(2);
    for (const id of brigades) expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, elf)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ultramarines Honour Guard", () => {
  it("squad once: two Guards, each pumping every other creature you control", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ultramarines Honour Guard"), { kicked: true, kickCount: 1 });
    const guards = named(game, "Ultramarines Honour Guard", A);
    expect(guards).toHaveLength(2);
    for (const id of guards) expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Sicarian Infiltrator", () => {
  it("squad twice: three Infiltrators, three cards drawn", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const card = toHand(game, "Sicarian Infiltrator");
    const before = hand(game).length;
    cast(game, card, { kicked: true, kickCount: 2 });
    const infiltrators = named(game, "Sicarian Infiltrator", A);
    expect(infiltrators).toHaveLength(3);
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("has flash: castable on an opponent's turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Sicarian Infiltrator");
    nextTurn(game); // Bob's precombat main
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    cast(game, card);
    expect(game.state.objects[card].zone).toBe("battlefield");
  });
});

describe("Endless Foot Assault", () => {
  it("whenever you attack, a tapped attacking 1/1 Ninja for each opponent, attacked or not", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Endless Foot Assault"));
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    const ninjas = tokensOf(game, "Ninja Token (Dark Leo & Shredder)");
    expect(ninjas).toHaveLength(2);
    for (const id of ninjas) expect(game.state.objects[id].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(19);
  });

  it("squad: each copy makes its own Ninjas", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Endless Foot Assault"), { kicked: true, kickCount: 1 });
    expect(named(game, "Endless Foot Assault", A)).toHaveLength(2);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensOf(game, "Ninja Token (Dark Leo & Shredder)")).toHaveLength(2);
    expect(life(game, B)).toBe(16);
  });
});
