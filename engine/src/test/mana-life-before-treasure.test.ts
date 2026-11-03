/**
 * The auto-payer's order between a source that costs life and a Treasure (a
 * bug report, 2026-11-03, room YQ9KA): Alice at 6 life, with Treasures to
 * spare, paid 2 life for Kaalia of the Vast and Boromir, Warden of the Tower.
 * At low life (a quarter of the starting life or less) a Treasure goes first;
 * above it a point of life does, unless that Treasure is being spent anyway.
 */

import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { parseManaCost } from "../mana.js";
import type { ManaPayment } from "../mana-payment.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const makeGame = (hand: readonly string[], startingLife = 40) => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife },
    controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
    decks: [
      { player: A, cards: [...hand, ...Array<string>(40 - hand.length).fill("Island")] },
      { player: B, cards: Array<string>(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return game;
};

const spawnUntapped = (game: Game, name: string): ObjectId => {
  const id = game.debugSpawn(name, A);
  game.state.objects[id]!.tapped = false;
  return id;
};

const castFromHand = (game: Game, name: string): void => {
  const card = game.handOf(A).find((id) => game.state.objects[id].cardName === name)!;
  game.dispatch({ type: "cast-spell", player: A, card });
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
};

const onBattlefield = (game: Game, id: ObjectId): boolean => game.state.zones.shared.battlefield.includes(id);

const planOf = (game: Game, cost: string): ManaPayment | null => (game as any).payMana(A, parseManaCost(cost));

/** Alice's board: Fellwar Stone makes what an opponent's lands could. */
const alicesBoard = (game: Game): ObjectId[] => {
  game.debugSpawn("Mountain", B);
  game.debugSpawn("Plains", B);
  for (const name of [
    "Silent Clearing",
    "Swamp",
    "Spire of Industry",
    "Urborg, Tomb of Yawgmoth",
    "Fellwar Stone",
    "Talisman of Hierarchy",
  ]) {
    spawnUntapped(game, name);
  }
  return [spawnUntapped(game, "Treasure Token"), spawnUntapped(game, "Treasure Token")];
};

describe("a Treasure spent anyway, at any life total", () => {
  it("pays the {W}, for no life", () => {
    // What was left for Boromir ({2}{W}): Spire's and the Talisman's free {C}
    // pay the {2} and the Treasure the {W}. Alice lost a life to the Talisman
    // here and spent the same Treasure on the {2}. At 40 life, as here, the
    // Treasure is spent either way, because nothing else can pay the third mana.
    const game = makeGame(["Boromir, Warden of the Tower"]);
    const spire = spawnUntapped(game, "Spire of Industry");
    const talisman = spawnUntapped(game, "Talisman of Hierarchy");
    const treasure = spawnUntapped(game, "Treasure Token");
    castFromHand(game, "Boromir, Warden of the Tower");
    expect(game.state.players[A].life).toBe(40);
    expect(game.state.objects[spire]?.tapped).toBe(true);
    expect(game.state.objects[talisman]?.tapped).toBe(true);
    expect(onBattlefield(game, treasure)).toBe(false);
  });

  it("isn't needed when a free source pays", () => {
    const game = makeGame(["Bonesplitter"]);
    spawnUntapped(game, "Mana Confluence");
    spawnUntapped(game, "Swamp");
    const treasure = spawnUntapped(game, "Treasure Token");
    castFromHand(game, "Bonesplitter");
    expect(game.state.players[A].life).toBe(40);
    expect(onBattlefield(game, treasure)).toBe(true);
  });
});

describe("a Treasure or a point of life", () => {
  it("casts both of Alice's spells without losing a life at 6 of 40", () => {
    const game = makeGame(["Kaalia of the Vast", "Boromir, Warden of the Tower"]);
    alicesBoard(game);
    game.state.players[A].life = 6;
    castFromHand(game, "Kaalia of the Vast");
    expect(game.state.players[A].life).toBe(6);
    castFromHand(game, "Boromir, Warden of the Tower");
    expect(game.state.players[A].life).toBe(6);
  });

  it("trades a point of life for a Treasure on the same board at 40", () => {
    // Seven mana from six sources and the Treasures, so one Treasure goes
    // whatever the life total, on Boromir's {W}. Kaalia's {R} is the trade:
    // Spire of Industry's point of life keeps the other Treasure.
    const game = makeGame(["Kaalia of the Vast", "Boromir, Warden of the Tower"]);
    const treasures = alicesBoard(game);
    castFromHand(game, "Kaalia of the Vast");
    expect(game.state.players[A].life).toBe(39);
    expect(treasures.filter((id) => onBattlefield(game, id))).toHaveLength(2);
    castFromHand(game, "Boromir, Warden of the Tower");
    expect(game.state.players[A].life).toBe(39);
    expect(treasures.filter((id) => onBattlefield(game, id))).toHaveLength(1);
  });

  it.each([
    [40, 10, true],
    [40, 11, false],
    [20, 5, true],
    [20, 6, false],
  ])("of %i starting life, at %i spends the Treasure: %s", (starting, life, spent) => {
    const game = makeGame([], starting);
    const clearing = spawnUntapped(game, "Silent Clearing");
    const treasure = spawnUntapped(game, "Treasure Token");
    game.state.players[A].life = life;
    expect(planOf(game, "{W}")?.steps.map((s) => s.source)).toEqual([spent ? treasure : clearing]);
  });
});

describe("at low life", () => {
  it("pays life when a Treasure can't cover it: a {W}{R} out of Silent Clearing's {W} and a Treasure", () => {
    // Weighing life last, the Treasure goes on the {W} and leaves no red; the
    // old order still finds the payment.
    const game = makeGame([]);
    const clearing = spawnUntapped(game, "Silent Clearing");
    const treasure = spawnUntapped(game, "Treasure Token");
    game.state.players[A].life = 10;
    const plan = planOf(game, "{W}{R}");
    expect(plan?.steps.map((s) => s.source).sort()).toEqual([clearing, treasure].sort());
    expect(plan?.steps.find((s) => s.source === clearing)?.lifeCost).toBe(1);
  });

  it("funds a Signet from a Treasure rather than Mana Confluence's life", () => {
    const game = makeGame(["Bonesplitter"]);
    spawnUntapped(game, "Mana Confluence");
    spawnUntapped(game, "Treasure Token");
    spawnUntapped(game, "Izzet Signet");
    game.state.players[A].life = 10;
    castFromHand(game, "Bonesplitter");
    expect(game.state.players[A].life).toBe(10);
  });

  it("spends a point of life before Black Lotus's three mana on a {1}", () => {
    const game = makeGame(["Bonesplitter"]);
    const confluence = spawnUntapped(game, "Mana Confluence");
    const lotus = spawnUntapped(game, "Black Lotus");
    game.state.players[A].life = 10;
    castFromHand(game, "Bonesplitter");
    expect(game.state.objects[confluence]?.tapped).toBe(true);
    expect(onBattlefield(game, lotus)).toBe(true);
    expect(game.state.players[A].life).toBe(9);
  });

  it("activates Spire of Industry before the Treasure that is its only artifact goes", () => {
    const game = makeGame([]);
    const spire = spawnUntapped(game, "Spire of Industry");
    const treasure = spawnUntapped(game, "Treasure Token");
    game.state.players[A].life = 10;
    const plan = planOf(game, "{W}{U}");
    expect(plan?.steps.map((s) => s.source)).toEqual([spire, treasure]);
  });
});
