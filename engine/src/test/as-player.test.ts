/**
 * `as-player`: any effect done by another player, so "target player scries" and
 * "its controller incubates" need no `who` of their own on the effect.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  named,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Excise the Imperfect: the target's controller incubates", () => {
  it("makes the Incubator theirs, with X read from the exiled permanent", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Excise the Imperfect"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("exile");
    expect(named(game, "Incubator Token", A)).toEqual([]);
    const [incubator] = named(game, "Incubator Token", B);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(5);
    expect(game.state.objects[incubator].controller).toBe(B);
  });
});

describe("Wheel and Deal: any number of target opponents", () => {
  it("has each target discard, then draw seven, and you draw one", () => {
    const { game } = table({ players: 4 });
    const held = toHand(game, "Grizzly Bears", B);
    for (let i = 0; i < 12; i += 1) toLibrary(game, "Island", B);
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Island");
    const myBefore = hand(game).length;
    lands(game, "Island", 4);
    const spell = toHand(game, "Wheel and Deal");
    cast(game, spell, { targets: [ref(B)] });
    expect(graveyard(game, B)).toContain(held);
    expect(hand(game, B).length).toBe(7);
    expect(hand(game).length).toBe(myBefore + 1);
  });
});

describe("Gandalf, Wandering Wizard: the source's owner, wherever it went", () => {
  it("draws three for his owner, even under someone else's control", () => {
    const { game } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Island", B);
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Island");
    const gandalf = spawn(game, "Gandalf, Wandering Wizard", B);
    game.state.objects[gandalf].controller = A;
    const bobBefore = hand(game, B).length;
    const myBefore = hand(game).length;
    lands(game, "Island", 6);
    activate(game, gandalf);
    expect(zone(game, gandalf)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(gandalf);
    expect(hand(game, B).length).toBe(bobBefore + 3);
    expect(hand(game).length).toBe(myBefore);
  });
});

describe("a decision inside goes to the named player", () => {
  const seer = defineCard({
    name: "Test Target Player Scries",
    manaCost: "{0}",
    colors: [],
    types: ["sorcery"],
    text: "Target player scries 1, then draws a card.",
    targets: ["player"],
    effect: {
      kind: "as-player",
      who: { target: 0 },
      effect: { kind: "sequence", effects: [{ kind: "scry", amount: 1 }, { kind: "draw", amount: 1 }] },
    },
  });

  it("asks them, not the caster, and they draw after it's answered", () => {
    const alice = new ScriptedController(A);
    const bob = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { skipFirstDraw: false, maxHandSize: 99, startingLife: 20 },
      controllers: { [A]: alice, [B]: bob },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
      registry: createDefaultRegistry().register(seer),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    let aliceAsked = 0;
    let bobAsked = 0;
    alice.chooseScryFn = () => {
      aliceAsked += 1;
      return [];
    };
    bob.chooseScryFn = () => {
      bobAsked += 1;
      return [];
    };
    const bobBefore = game.state.zones.perPlayer[B].hand.length;
    const aliceBefore = game.state.zones.perPlayer[A].hand.length;
    cast(game, game.debugSpawn(seer.name, A, "hand"), { targets: [ref(B)] });
    expect(aliceAsked).toBe(0);
    expect(bobAsked).toBe(1);
    expect(game.state.zones.perPlayer[B].hand.length).toBe(bobBefore + 1);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(aliceBefore);
  });
});
