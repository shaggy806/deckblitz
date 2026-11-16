/**
 * "Ward—Get five poison counters" (rule 702.21a with 122.1f): the targeting
 * player gets five poison counters, or the spell is countered. A player who
 * can't get poison counters (Melira, Sylvok Outcast) can't pay it (rule
 * 118.3), and nothing is asked. The Serpent Society, whose other trigger —
 * "whenever another creature you control with deathtouch dies, each opponent
 * sacrifices a nontoken creature" — is checked beside it.
 */

import { describe, expect, it } from "vitest";

import { HeuristicBotController, ScriptedController } from "../controller.js";
import { wardCostText } from "../effects.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import {
  A,
  B,
  C,
  cast,
  destroy,
  lands,
  quiet,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/** Alice's Shock at Bob's The Serpent Society, her answer to the ward set first. */
function shockSociety(game: Game): { society: ObjectId; shock: ObjectId } {
  const society = spawn(game, "The Serpent Society", B);
  lands(game, "Mountain", 1);
  const shock = toHand(game, "Shock");
  cast(game, shock, { targets: [ref(society)] });
  return { society, shock };
}

const poison = (game: Game, player = A): number => game.state.players[player].counters.poison ?? 0;

describe("Ward—Get five poison counters (The Serpent Society)", () => {
  it("reads as printed", () => {
    expect(wardCostText({ poisonCounters: 5 })).toBe("—Get five poison counters.");
    expect(wardCostText({ poisonCounters: 1 })).toBe("—Get a poison counter.");
  });

  it("paid: the payer gets five poison counters, and the spell resolves", () => {
    const { game, a } = table();
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [0];
    };
    const { society, shock } = shockSociety(game);
    expect(asked).toEqual([["Pay ward—Get five poison counters (or Shock is countered)"]]);
    expect(poison(game)).toBe(5);
    expect(poison(game, B)).toBe(0);
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[society].damageMarked).toBe(2);
  });

  it("paying with five already loses the game (rule 704.5c)", () => {
    const { game, a } = table();
    game.state.players[A].counters.poison = 5;
    a.chooseModesFn = () => [0];
    shockSociety(game);
    expect(poison(game)).toBe(10);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("declined: the spell is countered and no counters are given", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [];
    const { society, shock } = shockSociety(game);
    expect(poison(game)).toBe(0);
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[society].damageMarked).toBe(0);
  });

  it("a player who can't get poison counters can't pay it: nothing is asked, the spell is countered", () => {
    const { game, a } = table();
    spawn(game, "Melira, Sylvok Outcast", A);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    const { society } = shockSociety(game);
    expect(asked).toBe(false);
    expect(poison(game)).toBe(0);
    expect(game.state.objects[society].damageMarked).toBe(0);
  });

  it("the v1 bot pays it, but not with the five that would make ten", () => {
    for (const already of [0, 5]) {
      const registry = registryOf(table().game);
      const game = Game.create({
        seed: 1,
        shuffle: false,
        registry,
        rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
        controllers: { [A]: new HeuristicBotController(A, registry), [B]: new ScriptedController(B) },
        decks: [
          { player: A, cards: Array(40).fill("Wastes") },
          { player: B, cards: Array(40).fill("Wastes") },
        ],
      });
      game.advanceUntil((s: GameState) => s.turn.number === 1 && s.turn.step === "precombat-main");
      game.state.players[A].counters.poison = already;
      const society = spawn(game, "The Serpent Society", B);
      lands(game, "Mountain", 1);
      const shock = toHand(game, "Shock");
      game.dispatch({ type: "cast-spell", player: A, card: shock, targets: [ref(society)] });
      game.advanceUntil(quiet);
      expect(poison(game)).toBe(already === 0 ? 5 : already);
      expect(game.state.objects[society].damageMarked).toBe(already === 0 ? 2 : 0);
      expect(game.state.players[A].hasLost).toBe(false);
    }
  });
});

describe("The Serpent Society's deathtouch trigger", () => {
  it("another creature it controls with deathtouch dies: each opponent sacrifices a nontoken creature", () => {
    const { game } = table({ players: 3 });
    spawn(game, "The Serpent Society", A);
    const rats = spawn(game, "Typhoid Rats", A);
    const bobBear = spawn(game, "Grizzly Bears", B);
    const carolBear = spawn(game, "Grizzly Bears", C);
    destroy(game, rats);
    expect(zone(game, bobBear)).toBe("graveyard");
    expect(zone(game, carolBear)).toBe("graveyard");
  });

  it("not for a creature without deathtouch, nor for itself", () => {
    const { game } = table();
    const society = spawn(game, "The Serpent Society", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const bobBear = spawn(game, "Grizzly Bears", B);
    destroy(game, bear);
    expect(zone(game, bobBear)).toBe("battlefield");
    destroy(game, society);
    expect(zone(game, bobBear)).toBe("battlefield");
  });
});
