/**
 * Random choices made as an effect resolves: a card at random from a
 * graveyard (`choose-random-card` — Exalted Flamer of Tzeentch, Deadbridge
 * Chant), an opponent or a player at random (`choose-opponent`'s `random`),
 * and a mode at random among those still eligible (`modal`'s `random` and a
 * mode's `onlyIf` — Crystalline Giant). Nobody is asked; the pick comes from
 * the game's seeded randomness, so a replay makes the same one, and each is
 * announced as a `chosen-at-random` event.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  activate,
  counters,
  graveyard,
  life,
  settle,
  spawn,
  table,
  toGraveyard,
  toStep,
  zone,
} from "./harness.js";

/** Exalted Flamer's upkeep return over a graveyard of `names`, at `seed`:
 * which card came back. */
function flamerReturns(seed: number, names: readonly string[]): { returned: ObjectId[]; cards: ObjectId[] } {
  const { game } = table({ seed });
  spawn(game, "Exalted Flamer of Tzeentch");
  const cards = names.map((name) => toGraveyard(game, name));
  toStep(game, "upkeep");
  settle(game);
  return { returned: cards.filter((id) => zone(game, id) === "hand"), cards };
}

describe("choose-random-card", () => {
  it("returns one matching card, never one the filter excludes", () => {
    const { returned, cards } = flamerReturns(1, ["Grizzly Bears", "Lightning Bolt", "Forest"]);
    expect(returned).toEqual([cards[1]]);
  });

  it("does nothing when nothing in the graveyard matches", () => {
    const { returned } = flamerReturns(1, ["Grizzly Bears", "Forest"]);
    expect(returned).toEqual([]);
  });

  it("picks each matching card with some chance, the same one again for the same seed", () => {
    const names = ["Lightning Bolt", "Shock", "Divination", "Opt"];
    const picks = new Set<string>();
    for (let seed = 1; seed <= 16; seed += 1) {
      const { returned, cards } = flamerReturns(seed, names);
      expect(returned).toHaveLength(1);
      picks.add(names[cards.indexOf(returned[0])]);
      // Deterministic: the same seed picks the same card.
      const again = flamerReturns(seed, names);
      expect(again.cards.indexOf(again.returned[0])).toBe(cards.indexOf(returned[0]));
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it("announces the card it picked", () => {
    const { game } = table();
    const flamer = spawn(game, "Exalted Flamer of Tzeentch");
    const bolt = toGraveyard(game, "Lightning Bolt");
    toStep(game, "upkeep");
    settle(game);
    const announced = game.events.filter((e) => e.type === "chosen-at-random");
    expect(announced).toEqual([
      expect.objectContaining({ player: A, source: flamer, chosen: { kind: "card", object: bolt } }),
    ]);
  });

  it("Deadbridge Chant puts a creature card onto the battlefield and anything else into your hand", () => {
    const { game } = table();
    spawn(game, "Deadbridge Chant");
    const bears = toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");

    const other = table();
    spawn(other.game, "Deadbridge Chant");
    const bolt = toGraveyard(other.game, "Lightning Bolt");
    toStep(other.game, "upkeep");
    settle(other.game);
    expect(zone(other.game, bolt)).toBe("hand");
    expect(graveyard(other.game)).toEqual([]);
  });
});

describe("modal: random", () => {
  it("Crystalline Giant puts on the one kind of counter it doesn't have yet", () => {
    const { game } = table();
    const giant = spawn(game, "Crystalline Giant");
    const kinds = ["flying", "first-strike", "deathtouch", "hexproof", "lifelink", "menace", "reach", "trample", "vigilance"];
    for (const kind of kinds) game.state.objects[giant].counters = { ...game.state.objects[giant].counters, [kind]: 1 };
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, giant, "+1/+1")).toBe(1);
    for (const kind of kinds) expect(counters(game, giant, kind)).toBe(1);
  });

  it("Crystalline Giant with all ten kinds puts on nothing", () => {
    const { game } = table();
    const giant = spawn(game, "Crystalline Giant");
    const all = ["flying", "first-strike", "deathtouch", "hexproof", "lifelink", "menace", "reach", "trample", "vigilance", "+1/+1"];
    for (const kind of all) game.state.objects[giant].counters = { ...game.state.objects[giant].counters, [kind]: 1 };
    toStep(game, "begin-combat");
    settle(game);
    for (const kind of all) expect(counters(game, giant, kind)).toBe(1);
    expect(game.events.some((e) => e.type === "chosen-at-random")).toBe(false);
  });

  it("Crystalline Giant gets a different kind each combat", () => {
    const { game } = table();
    const giant = spawn(game, "Crystalline Giant");
    toStep(game, "begin-combat");
    settle(game);
    toStep(game, "begin-combat");
    settle(game);
    const held = Object.entries(game.state.objects[giant].counters ?? {}).filter(([, n]) => (n ?? 0) > 0);
    expect(held).toHaveLength(2);
    expect(held.every(([, n]) => n === 1)).toBe(true);
  });
});

// Test-only cards: no card in the pool picks an opponent or a player at
// random by itself yet (Vial Smasher the Fierce, Indoraptor and Wildfire
// Devils each wait on something else too).
const PING_OPPONENT = "Test Random Opponent Ping";
const PING_PLAYER = "Test Random Player Ping";
const registry = createDefaultRegistry().register(
  defineCard({
    name: PING_OPPONENT,
    manaCost: "{0}",
    types: ["artifact"],
    text: "{T}: Choose an opponent at random. That player loses 1 life.",
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "choose-opponent", random: true, then: { kind: "lose-life", amount: 1, who: "that-player" } },
        resolve: null,
        text: "{T}: Choose an opponent at random. That player loses 1 life.",
      },
    ],
  }),
).register(
  defineCard({
    name: PING_PLAYER,
    manaCost: "{0}",
    types: ["artifact"],
    text: "{T}: Choose a player at random. That player loses 1 life.",
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: {
          kind: "choose-opponent",
          random: true,
          anyPlayer: true,
          then: { kind: "lose-life", amount: 1, who: "that-player" },
        },
        resolve: null,
        text: "{T}: Choose a player at random. That player loses 1 life.",
      },
    ],
  }),
);

/** Who lost life to `card`'s one activation in a four-player game at `seed`. */
function pinged(card: string, seed: number): PlayerId[] {
  const players = [A, B, C, D];
  const game = Game.create({
    seed,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
    controllers: Object.fromEntries(players.map((p) => [p, new ScriptedController(p)])),
    decks: players.map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  activate(game, spawn(game, card));
  settle(game);
  return players.filter((p) => life(game, p) === 19);
}

describe("choose-opponent: random", () => {
  it("picks exactly one opponent, never you, and not always the same one", () => {
    const seen = new Set<PlayerId>();
    for (let seed = 1; seed <= 16; seed += 1) {
      const hit = pinged(PING_OPPONENT, seed);
      expect(hit).toHaveLength(1);
      expect(hit[0]).not.toBe(A);
      seen.add(hit[0]);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("with anyPlayer, can pick you too", () => {
    const seen = new Set<PlayerId>();
    for (let seed = 1; seed <= 24; seed += 1) {
      const hit = pinged(PING_PLAYER, seed);
      expect(hit).toHaveLength(1);
      seen.add(hit[0]);
    }
    expect(seen.has(A)).toBe(true);
    expect(seen.size).toBeGreaterThan(2);
  });
});
