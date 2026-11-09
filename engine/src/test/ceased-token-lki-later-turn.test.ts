/**
 * A token that has ceased to exist (rule 704.5d) is read by last-known information (608.2h) for as
 * long as something can still ask about it, which a delayed ability may do on a later turn.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import { A, activate, life, ref, settle, spawn, table } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const TEXT = "Exile target creature. At the beginning of the next upkeep, you gain life equal to its power.";
const token = defineCard({
  name: "Test Lingering Token",
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "",
});
const exiler = defineCard({
  name: "Test Remembering Exiler",
  manaCost: "{1}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "delayed-trigger",
            at: "next-upkeep",
            effect: { kind: "gain-life", amount: { powerOf: 0 } },
            text: TEXT,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
const registry = createDefaultRegistry().register(token).register(exiler);

/** A token exiled by an ability with a delayed part that reads it next turn. */
const make = (game: Game): ObjectId => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Test Lingering Token", count: 1 });
  settle(game);
  return game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Test Lingering Token")!;
};
const sacrifice = (game: Game, id: ObjectId): void => {
  activate(game, spawn(game, "Test Remembering Exiler"), 0, { targets: [ref(id)] });
};

describe("a ceased token's last-known information past its turn", () => {
  it("a delayed ability it set up reads it on the next turn", () => {
    const { game } = table({ registry });
    const id = make(game);
    sacrifice(game, id);
    expect(game.state.objects[id]).toBeUndefined();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    settle(game);
    expect(life(game, A)).toBe(23);
  });

  it("is dropped once nothing is left to ask", () => {
    const { game } = table({ registry });
    const id = make(game);
    sacrifice(game, id);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    settle(game);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(game.state.ceasedTokens?.[id]).toBeUndefined();
  });
});
