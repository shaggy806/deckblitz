/**
 * "Each player shuffles their hand and graveyard into their library" (rule
 * 701.24a): `shuffle-graveyard-into-library`'s `zones` — hand, graveyard
 * and the permanents a player owns, all in one move — and `drawThatMany`,
 * "then draws that many cards", each player the number they put in (a token
 * counting, The Great Aurora's ruling).
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("shuffle zones into library", () => {
  it("Timetwister: every hand and graveyard goes in, then each player draws seven", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const twister = toHand(game, "Timetwister");
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant", B);
    const dead = toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Shock", B);
    // Everything but the Timetwister itself, which is on the stack.
    const total = (p: typeof A, less: number): number =>
      library(game, p).length + hand(game, p).length + graveyard(game, p).length - less;
    const before = { a: total(A, 1), b: total(B, 0) };
    cast(game, twister);
    expect(hand(game)).toHaveLength(7);
    expect(hand(game, B)).toHaveLength(7);
    expect(library(game).length).toBe(before.a - 7);
    expect(library(game, B).length).toBe(before.b - 7);
    expect(zone(game, dead)).toBe("library");
    // The spell itself resolved on the stack and went to the graveyard after.
    expect(graveyard(game)).toEqual([twister]);
    expect(graveyard(game, B)).toEqual([]);
  });

  it("Winds of Change: each player draws as many as they shuffled in from their hand", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const winds = toHand(game, "Winds of Change");
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    toHand(game, "Shock", B);
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Gray Ogre", B);
    const kept = toGraveyard(game, "Lightning Bolt");
    const before = { a: hand(game).length - 1, b: hand(game, B).length };
    const bears = hand(game).find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    cast(game, winds);
    expect(hand(game)).toHaveLength(before.a);
    expect(hand(game, B)).toHaveLength(before.b);
    expect(bears === undefined ? "none" : zone(game, bears)).toBe("library");
    // Only the hand goes: the graveyard stays.
    expect(zone(game, kept)).toBe("graveyard");
  });

  it("Whirlpool Warrior: its enters trigger is yours alone; its sacrifice, everyone's", () => {
    const { game } = table();
    toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const shock = toHand(game, "Shock", B);
    const before = { a: hand(game).length, b: hand(game, B).length };
    const warrior = enter(game, "Whirlpool Warrior");
    expect(hand(game)).toHaveLength(before.a);
    // Bob's hand isn't touched by the enters trigger.
    expect(zone(game, shock)).toBe("hand");
    lands(game, "Mountain", 1);
    toHand(game, "Gray Ogre", B);
    activate(game, warrior, 0);
    expect(zone(game, warrior)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before.a);
    expect(hand(game, B)).toHaveLength(before.b + 1);
    expect(zone(game, shock)).toBe("library");
  });
});

describe("the permanents a player owns", () => {
  const AURORA = "Test Aurora";
  const registry = createDefaultRegistry().register(
    defineCard({
      name: AURORA,
      manaCost: "{0}",
      types: ["sorcery"],
      text: "Each player shuffles all cards from their hand and all permanents they own into their library, then draws that many cards.",
      targets: [],
      effect: {
        kind: "shuffle-graveyard-into-library",
        target: "each-player",
        zones: ["hand", "permanents"],
        drawThatMany: true,
      },
    }),
  );

  it("goes by owner, not controller, and a token counts toward the draw", () => {
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const aurora = toHand(game, AURORA);
    const bears = spawn(game, "Grizzly Bears");
    // Bob owns the Giant, though Alice controls it.
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Act of Treason"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].controller).toBe(A);
    const soldier = spawn(game, "Soldier Token");
    toHand(game, "Gray Ogre", B);
    const before = { a: hand(game).length - 1, b: hand(game, B).length };
    cast(game, aurora);
    settle(game);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(giant);
    expect(game.state.objects[soldier]?.zone ?? "gone").not.toBe("battlefield");
    // Alice: her three Mountains, the Bears and the token → 5 more; Bob:
    // his hand (the Ogre among it) and the Giant he owns → 1 more.
    expect(hand(game)).toHaveLength(before.a + 5);
    expect(hand(game, B)).toHaveLength(before.b + 1);
  });
});
