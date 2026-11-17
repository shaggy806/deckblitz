/**
 * Definition shapes that used to do something other than what they say, with
 * nothing said, and now work: two triggered entries that each name the other
 * with `sameAbilityAs` are one ability (they were counted apart), and a
 * `turn-history` condition's `who: "opponent"` is one opponent's own count
 * (it was every opponent's together). The shapes that stay wrong are refused
 * by name in `cards/pool.test.ts`'s "definition traps".
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { TriggeredAbility } from "../abilities.js";
import { B, C, cast, enter, hand, lands, life, spawn, table, toHand } from "./harness.js";

const VOYAGER_TEXT =
  "Whenever this creature or another creature you control enters, you gain 1 life. If this is the second time this ability has resolved this turn, draw a card.";
const gainThenDraw: Omit<TriggeredAbility, "trigger" | "sameAbilityAs"> = {
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 1 },
      { kind: "conditional", condition: { kind: "resolved-this-turn", n: 2 }, then: { kind: "draw", amount: 1 } },
    ],
  },
  resolve: null,
  text: VOYAGER_TEXT,
};
/** South Pole Voyager's shape, its two entries naming each other. */
const mutualVoyager = defineCard({
  name: "Test Mutual Voyager",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Scout"],
  power: 2,
  toughness: 2,
  text: VOYAGER_TEXT,
  triggered: [
    { ...gainThenDraw, trigger: { on: "enters-battlefield", who: "self" }, sameAbilityAs: 1 },
    { ...gainThenDraw, trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true }, sameAbilityAs: 0 },
  ],
});

describe("two entries that name each other with sameAbilityAs", () => {
  it("are one ability: the second entry's resolution is its second this turn", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(mutualVoyager);
    enter(game, "Test Mutual Voyager");
    expect(life(game)).toBe(21);
    const before = hand(game).length;
    enter(game, "Grizzly Bears");
    expect(life(game)).toBe(22);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("a turn-history condition about an opponent", () => {
  it("is one opponent's own count, not the opponents' together (Whiplash Trap)", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", C);
    enter(game, "Grizzly Bears", B);
    enter(game, "Grizzly Bears", C);
    const trap = toHand(game, "Whiplash Trap");
    const targets = [
      { kind: "object" as const, object: x },
      { kind: "object" as const, object: y },
    ];
    expect(() => cast(game, trap, { altCost: true, targets, settle: false })).toThrow(/no alternative cost/);
    enter(game, "Grizzly Bears", C);
    cast(game, trap, { altCost: true, targets });
  });
});
