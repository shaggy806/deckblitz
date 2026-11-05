// Batch 264 (need-keys Phase 2, the freed cards of list F3): the lead's
// engine fix. A mass effect's filter is read with the effect's source, so
// `isSource: false` ("all other creatures") spares it: `tap-all` and
// `return-to-hand-all` read their filter without one, so "other" matched the
// source too (Dread Cacodemon tapped itself, Denizen of the Deep bounced
// itself, in the batch's tests), where `sacrifice-all` already passed it.
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const registry = createDefaultRegistry().register(
  defineCard({
    name: "Test Other-Creature Source",
    manaCost: "{0}",
    types: ["creature"],
    power: 1,
    toughness: 1,
    text: "",
  }),
);

const setUp = () => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: Array<string>(40).fill("Island") },
      { player: B, cards: Array<string>(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  return game;
};
const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

describe("a mass effect's `isSource: false` spares its source", () => {
  it("tap-all taps every other creature, not the source", () => {
    const game = setUp();
    const source = game.debugSpawn("Test Other-Creature Source", A, "battlefield");
    const mine = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const effect: EffectSpec = { kind: "tap-all", filter: { type: "creature", isSource: false } };
    game.debugApplyEffect(A, effect, [], { source });
    game.advanceUntil(quiet);
    expect(game.state.objects[source].tapped).toBe(false);
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("return-to-hand-all returns every other creature, not the source", () => {
    const game = setUp();
    const source = game.debugSpawn("Test Other-Creature Source", A, "battlefield");
    const mine = game.debugSpawn("Grizzly Bears", A, "battlefield");
    const theirs = game.debugSpawn("Grizzly Bears", B, "battlefield");
    const effect: EffectSpec = { kind: "return-to-hand-all", filter: { type: "creature", isSource: false } };
    game.debugApplyEffect(A, effect, [], { source });
    game.advanceUntil(quiet);
    expect(game.state.objects[source].zone).toBe("battlefield");
    expect(game.state.objects[mine]?.zone ?? "gone").not.toBe("battlefield");
    expect(game.state.objects[theirs]?.zone ?? "gone").not.toBe("battlefield");
  });
});

describe("Armed and Armored", () => {
  it("attaches the Equipment chosen as it resolves to the Dwarf chosen before them", async () => {
    const { table, spawn, lands, cast, toHand } = await import("./harness.js");
    const { game, a } = table();
    lands(game, "Plains", 2);
    const dwarf = spawn(game, "Aerial Responder");
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    const sword = spawn(game, "Short Sword");
    let call = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      call += 1;
      if (call === 1) {
        expect(eligible).toEqual([dwarf]);
        return [dwarf];
      }
      expect([...eligible].sort()).toEqual([splitter, sword].sort());
      return [splitter, sword];
    };
    cast(game, toHand(game, "Armed and Armored"));
    expect(call).toBe(2);
    expect(game.state.objects[splitter].attachedTo).toBe(dwarf);
    expect(game.state.objects[sword].attachedTo).toBe(dwarf);
    expect(game.state.objects[bears].attachedTo).toBeUndefined();
  });
});
