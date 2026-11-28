/**
 * A mana ability whose cost untaps a permanent another player controls, and
 * the mana it makes is what that permanent could produce (rules 106.7,
 * 605.1a, 605.3b) — Benthic Explorers' "{T}, Untap a tapped land an opponent
 * controls: Add one mana of any type that land could produce."
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { candidateActions } from "../bot/candidates.js";
import { RandomController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, spawn, table } from "./harness.js";

type AbilityOffer = Extract<ReturnType<Game["legalActions"]>[number], { kind: "activate-ability" }>;

const pool = (game: Game, player = A): string[] => game.state.players[player].manaPool.map((unit) => unit.type).sort();

const offersOf = (game: Game, source: ObjectId): AbilityOffer[] =>
  game.legalActions(A).filter((o): o is AbilityOffer => o.kind === "activate-ability" && o.source === source);

const activate = (game: Game, source: ObjectId, extra: Partial<Extract<Action, { type: "activate-ability" }>>): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], ...extra } as Action);
};

describe("Benthic Explorers", () => {
  it("offers each type an opponent's tapped land could produce, with only the lands that make it", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const forest = spawn(game, "Forest", B, { tapped: true });
    const island = spawn(game, "Island", B, { tapped: true });
    spawn(game, "Mountain", B); // untapped: can't be untapped
    spawn(game, "Plains", A, { tapped: true }); // its own: not an opponent's
    const offers = offersOf(game, explorers);
    const byColor = new Map(offers.map((o) => [o.manaColors?.[0] ?? "none", o.sacrifice]));
    expect([...byColor.keys()].sort()).toEqual(["G", "U"]);
    expect(byColor.get("G")).toEqual({ choices: [forest], untap: true });
    expect(byColor.get("U")).toEqual({ choices: [island], untap: true });
  });

  it("untaps the named land and adds one mana of a type it could produce", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const forest = spawn(game, "Forest", B, { tapped: true });
    activate(game, explorers, { sacrifice: forest, manaColors: ["G"] });
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(game.state.objects[explorers].tapped).toBe(true);
    expect(pool(game)).toEqual(["G"]);
    // A mana ability: nothing went on the stack (605.3b).
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("refuses a land that isn't tapped, isn't an opponent's, or can't make the type picked", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const forest = spawn(game, "Forest", B, { tapped: true });
    const untapped = spawn(game, "Island", B);
    const mine = spawn(game, "Island", A, { tapped: true });
    expect(() => activate(game, explorers, { sacrifice: untapped, manaColors: ["U"] })).toThrow(/untapping/);
    expect(() => activate(game, explorers, { sacrifice: mine, manaColors: ["U"] })).toThrow(/untapping/);
    expect(() => activate(game, explorers, { sacrifice: forest, manaColors: ["U"] })).toThrow(/untapping/);
    expect(game.state.objects[explorers].tapped).toBe(false);
  });

  it("isn't offered, and is refused, with no tapped land opposite (118.3)", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const forest = spawn(game, "Forest", B);
    spawn(game, "Grizzly Bears", B, { tapped: true }); // tapped, but no land
    expect(offersOf(game, explorers)).toEqual([]);
    expect(() => activate(game, explorers, { sacrifice: forest, manaColors: ["G"] })).toThrow(/tapped permanents to untap|untapping/);
    expect(game.state.objects[explorers].tapped).toBe(false);
  });

  it("an action naming no colour may untap any of them, for the first type it could produce", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    spawn(game, "Forest", B, { tapped: true });
    const island = spawn(game, "Island", B, { tapped: true });
    activate(game, explorers, { sacrifice: island });
    expect(game.state.objects[island].tapped).toBe(false);
    expect(pool(game)).toEqual(["U"]);
  });

  it("every offer, as the random controller and v2's candidates build it, can be dispatched", () => {
    const board = () => {
      const { game } = table();
      const explorers = spawn(game, "Benthic Explorers");
      spawn(game, "Forest", B, { tapped: true });
      spawn(game, "Island", B, { tapped: true });
      spawn(game, "Island", B, { tapped: true });
      return { game, explorers };
    };
    const colors = offersOf(board().game, board().explorers).map((o) => o.manaColors?.[0]);
    expect(colors.sort()).toEqual(["G", "U"]);
    for (const build of ["random", "v2"] as const) {
      for (const color of colors) {
        for (const dice of [0, 0.99]) {
          const { game, explorers } = board();
          const offer = offersOf(game, explorers).find((o) => o.manaColors?.[0] === color)!;
          const action =
            build === "random"
              ? new RandomController(A, () => dice).act({ state: game.state, player: A, legalActions: () => [offer] })
              : candidateActions(offer, A)[0];
          expect(() => game.dispatch(action)).not.toThrow();
          expect(pool(game)).toEqual([color]);
        }
      }
    }
  });

  it("makes no mana for a land that could produce none (106.7), still untapping it", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const depths = spawn(game, "Dark Depths", B, { tapped: true });
    const offer = offersOf(game, explorers).find((o) => (o.manaColors?.length ?? 0) === 0);
    expect(offer?.sacrifice?.choices).toEqual([depths]);
    activate(game, explorers, { sacrifice: depths, manaColors: [] });
    expect(game.state.objects[depths].tapped).toBe(false);
    expect(pool(game)).toEqual([]);
  });

  it("reads colourless as a type a land could produce", () => {
    const { game } = table();
    const explorers = spawn(game, "Benthic Explorers");
    const wastes = spawn(game, "Wastes", B, { tapped: true });
    activate(game, explorers, { sacrifice: wastes, manaColors: ["C"] });
    expect(pool(game)).toEqual(["C"]);
  });
});
