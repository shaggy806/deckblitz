/**
 * The `amounts` condition: an intervening-if (rule 603.4) comparing two
 * amounts, asked as the ability triggers and again as it resolves. Liberator,
 * Urza's Battlethopter and ED-E, Lonesome Eyebot.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  lands,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const liberator = (game: Game): ObjectId => spawn(game, "Liberator, Urza's Battlethopter", A);

describe("Liberator, Urza's Battlethopter", () => {
  it("grows when the mana spent is greater than its power, and only then", () => {
    const { game } = table();
    const lib = liberator(game);
    lands(game, "Wastes", 4);
    // 2 spent against a power of 1.
    cast(game, toHand(game, "Mind Stone"));
    expect(counters(game, lib)).toBe(1);
    expect(pt(game, lib)).toEqual({ power: 2, toughness: 3 });
    // 2 against a power of 2: not greater.
    cast(game, toHand(game, "Mind Stone"));
    expect(counters(game, lib)).toBe(1);
  });

  it("reads the mana spent, not the mana cost: a free spell spends nothing", () => {
    const { game } = table();
    const lib = liberator(game);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, lib)).toBe(0);
  });

  it("compares with its power as it stands, below zero too", () => {
    const { game } = table();
    const lib = liberator(game);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" }, [ref(lib)]);
    settle(game);
    expect(pt(game, lib).power).toBe(-1);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, lib)).toBe(1);
  });

  it("asks again as it resolves: a power raised past the mana spent, no counter", () => {
    const { game } = table();
    const lib = liberator(game);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Mind Stone"), { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" }, [ref(lib)]);
    settle(game);
    expect(counters(game, lib)).toBe(0);
  });

  it("a spell countered in response is read as it was on the stack (608.2h)", () => {
    const { game } = table();
    const lib = liberator(game);
    lands(game, "Wastes", 2);
    const stone = toHand(game, "Mind Stone");
    cast(game, stone, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(stone)]);
    settle(game);
    expect(zone(game, stone)).toBe("graveyard");
    expect(counters(game, lib)).toBe(1);
  });

  it("doesn't trigger on another player's spell", () => {
    const { game } = table();
    const lib = spawn(game, "Liberator, Urza's Battlethopter", B);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Mind Stone"));
    expect(counters(game, lib)).toBe(0);
  });

  it("lets colorless and artifact spells be cast at instant speed, and nothing else", () => {
    const { game } = table();
    liberator(game);
    lands(game, "Wastes", 2);
    lands(game, "Forest", 4);
    nextTurn(game);
    toStep(game, "end", A);
    const stone = toHand(game, "Mind Stone");
    cast(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
  });
});

describe("ED-E, Lonesome Eyebot", () => {
  it("takes a quest counter only while the attackers outnumber its counters", () => {
    const { game, a } = table();
    const ede = spawn(game, "ED-E, Lonesome Eyebot", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    attack(game, a, [bears]);
    expect(counters(game, ede, "quest")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    // One attacker against one counter: not greater.
    attack(game, a, [ede]);
    expect(counters(game, ede, "quest")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [ede, bears]);
    expect(counters(game, ede, "quest")).toBe(2);
  });

  it("sacrificed, draws a card and one more for each quest counter it had", () => {
    const { game, a } = table();
    const ede = spawn(game, "ED-E, Lonesome Eyebot", A, { sick: false });
    attack(game, a, [ede]);
    expect(counters(game, ede, "quest")).toBe(1);
    lands(game, "Wastes", 2);
    for (let n = 0; n < 2; n++) toLibrary(game, "Wastes");
    const before = hand(game, A).length;
    activate(game, ede, 0);
    expect(zone(game, ede)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 2);
  });
});
