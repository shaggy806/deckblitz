/**
 * "This creature's power" in a delayed triggered ability, when the source has left by then: the
 * effect reads the source as it last existed (rule 608.2h), for the object the creating ability
 * meant (603.7c, 400.7).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import type { ObjectId } from "../primitives.js";
import { A, activate, destroy, life, settle, spawn, table } from "./harness.js";

const delayed = {
  kind: "delayed-trigger",
  at: "next-upkeep",
  effect: { kind: "gain-life", amount: { powerOf: "source" } },
  text: "At the beginning of the next upkeep, you gain life equal to this creature's power.",
} as const;
const sacrificer = defineCard({
  name: "Test Sacrificing Delayer",
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "",
  activated: [{ cost: { mana: "{0}", tap: false, sacrifice: "self" }, targets: [], effect: delayed, resolve: null, text: "" }],
});
const stayer = defineCard({
  name: "Test Staying Delayer",
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "",
  activated: [{ cost: { mana: "{0}", tap: false }, targets: [], effect: delayed, resolve: null, text: "" }],
});
const registry = createDefaultRegistry().register(sacrificer).register(stayer);
const toUpkeep = (game: ReturnType<typeof table>["game"]): void => {
  game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
  settle(game);
};
const counters = (game: ReturnType<typeof table>["game"], id: ObjectId, amount: number): void => {
  game.state.objects[id].counters = { "+1/+1": amount };
};

describe("a delayed ability reads its departed source", () => {
  it("a token sacrificed to make it, on a later turn", () => {
    const { game } = table({ registry });
    game.debugApplyEffect(A, { kind: "create-token", token: "Test Sacrificing Delayer", count: 1 });
    settle(game);
    const id = game.state.zones.shared.battlefield.find((o) => game.state.objects[o].cardName === "Test Sacrificing Delayer")!;
    activate(game, id, 0);
    settle(game);
    expect(game.state.objects[id]).toBeUndefined();
    toUpkeep(game);
    expect(life(game, A)).toBe(23);
  });

  it("a card sacrificed to make it, as it last was on the battlefield", () => {
    const { game } = table({ registry });
    const id = spawn(game, "Test Sacrificing Delayer");
    counters(game, id, 2);
    activate(game, id, 0);
    settle(game);
    expect(game.state.objects[id].zone).toBe("graveyard");
    toUpkeep(game);
    expect(life(game, A)).toBe(25);
  });

  it("a source that left after making it", () => {
    const { game } = table({ registry });
    const id = spawn(game, "Test Staying Delayer");
    counters(game, id, 1);
    activate(game, id, 0);
    settle(game);
    destroy(game, id);
    toUpkeep(game);
    expect(life(game, A)).toBe(23);
  });

  it("a source still there is read as it is", () => {
    const { game } = table({ registry });
    const id = spawn(game, "Test Staying Delayer");
    activate(game, id, 0);
    settle(game);
    counters(game, id, 2);
    toUpkeep(game);
    expect(life(game, A)).toBe(24);
  });
});
