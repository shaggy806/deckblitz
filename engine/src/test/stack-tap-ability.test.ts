/**
 * A `{T}` ability on a token stack taps one token of it, split off first — not the whole stack:
 * a stack is a representation and may not change a result. Here a static grants "{T}: You gain 1
 * life." to creature tokens, and three Soldiers in one stack gain 3 life, one at a time.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";

import { A, B, activate, life, settle, spawn } from "./harness.js";

const GRANT = "Creature tokens you control have \"{T}: You gain 1 life.\"";
const banner = defineCard({
  name: "Test Banner of Small Mercies",
  manaCost: "{1}",
  types: ["enchantment"],
  text: GRANT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "gain-life", amount: 1 },
          resolve: null,
          text: "{T}: You gain 1 life.",
        },
      ],
      text: GRANT,
    },
  ],
});

describe("a {T} ability on a token stack taps one token", () => {
  it("twenty Soldiers in one stack: three activations, three taps, 3 life", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry: createDefaultRegistry().register(banner),
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    spawn(game, "Test Banner of Small Mercies");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 20 });
    settle(game);
    // Old enough to tap: not summoning sick.
    const soldiers = () =>
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Soldier Token");
    for (const id of soldiers()) game.state.objects[id].summoningSick = false;
    // One stack of them.
    expect(soldiers()).toHaveLength(1);
    for (let i = 0; i < 3; i += 1) {
      const untapped = soldiers().find((id) => !game.state.objects[id].tapped);
      if (untapped === undefined) throw new Error("no untapped Soldier");
      activate(game, untapped, 0);
    }
    expect(life(game)).toBe(23);
    const untapped = soldiers()
      .filter((id) => !game.state.objects[id].tapped)
      .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(untapped).toBe(17);
  });
});
