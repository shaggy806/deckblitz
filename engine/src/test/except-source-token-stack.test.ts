/**
 * "All other …" when the source is one token of a stack: only that token is
 * left out, and its fellows are others. A stack is a representation, so it
 * may not change a result. A token with an activated ability is woken into
 * separate objects, so it's a stack's triggers that get here: one per token
 * (`PendingTrigger.copies`), each sparing its own token.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { computeCharacteristics } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, settle, spawn, table } from "./harness.js";

const upkeepCreature = (name: string, effect: EffectSpec) =>
  defineCard({
    name,
    manaCost: "{1}",
    types: ["creature"],
    subtypes: ["Soldier"],
    power: 2,
    toughness: 3,
    text: "At the beginning of your upkeep, do it to the others.",
    triggered: [
      {
        trigger: { on: "step-begins", step: "upkeep", who: "you" },
        targets: [],
        effect,
        resolve: null,
        text: "At the beginning of your upkeep, do it to the others.",
      },
    ],
  });

const others = { type: "creature" } as const;
const registry = () =>
  createDefaultRegistry()
    .register(upkeepCreature("Test Exiler", { kind: "exile-all", filter: others, exceptSource: true }))
    .register(upkeepCreature("Test Pinger", { kind: "damage-all", filter: others, amount: 1, exceptSource: true }))
    .register(upkeepCreature("Test Pumper", { kind: "modify-pt-all", filter: others, power: 1, toughness: 1, duration: "end-of-turn", exceptSource: true }))
    .register(upkeepCreature("Test Counters", { kind: "add-counter-all", filter: others, counter: "+1/+1", amount: 1, exceptSource: true }));

function stackOf(game: Game, name: string, n: number): ObjectId {
  const id = spawn(game, name);
  game.state.objects[id].isToken = true;
  game.state.objects[id].stackCount = n;
  return id;
}

/** Alice's next upkeep, its triggers resolved. */
function upkeep(game: Game): void {
  game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === A && s.turn.number > 1);
  settle(game);
}

const named = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);
const each = (game: Game, name: string, read: (id: ObjectId) => number): number[] =>
  named(game, name).flatMap((id) => Array<number>(game.state.objects[id].stackCount ?? 1).fill(read(id)));

describe("exceptSource, from a token stack", () => {
  it("exile-all: each token's trigger leaves only that token, so none outlasts the next", () => {
    const { game } = table({ registry: registry() });
    stackOf(game, "Test Exiler", 3);
    upkeep(game);
    expect(each(game, "Test Exiler", () => 1)).toEqual([]);
  });

  it("damage-all: each token is dealt damage by the other two", () => {
    const { game } = table({ registry: registry() });
    stackOf(game, "Test Pinger", 3);
    upkeep(game);
    expect(each(game, "Test Pinger", (id) => game.state.objects[id].damageMarked)).toEqual([2, 2, 2]);
  });

  it("modify-pt-all: each token is pumped by the other two", () => {
    const { game } = table({ registry: registry() });
    stackOf(game, "Test Pumper", 3);
    upkeep(game);
    const powers = each(game, "Test Pumper", (id) => computeCharacteristics(game.state, game.registry, id).power);
    expect(powers).toEqual([4, 4, 4]);
  });

  it("add-counter-all: each token gets one from the other two", () => {
    const { game } = table({ registry: registry() });
    stackOf(game, "Test Counters", 3);
    upkeep(game);
    expect(each(game, "Test Counters", (id) => game.state.objects[id].counters["+1/+1"] ?? 0)).toEqual([2, 2, 2]);
  });
});
