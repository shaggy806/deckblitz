/**
 * The journal's `"crewers"` — the creatures that crewed a Vehicle this turn
 * (rule 702.122b), recorded as each is tapped for its crew cost — read with
 * `selfOnly` as "each creature that crewed it this turn" (Luxurious
 * Locomotive), those that have left the battlefield since included (its
 * ruling), and each once.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, destroy, spawn, settle, table, tokensNamed } from "./harness.js";

const LOCO = "Luxurious Locomotive";

function crewWith(game: Game, source: ObjectId, tap: readonly ObjectId[]): void {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("Luxurious Locomotive", () => {
  it("a Treasure for each creature that crewed it this turn, one that has died since included", () => {
    const { game, a } = table();
    const loco = spawn(game, LOCO);
    const crew = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Llanowar Elves")];
    crewWith(game, loco, crew);
    destroy(game, crew[2]);
    attack(game, a, [loco]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("crews only once each turn", () => {
    const { game } = table();
    const loco = spawn(game, LOCO);
    crewWith(game, loco, [spawn(game, "Grizzly Bears")]);
    expect(() => crewWith(game, loco, [spawn(game, "Grizzly Bears")])).toThrow(/already/i);
  });

  it("not the creatures that crewed another Vehicle", () => {
    const { game, a } = table();
    const loco = spawn(game, LOCO);
    const copter = spawn(game, "Smuggler's Copter");
    crewWith(game, copter, [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")]);
    crewWith(game, loco, [spawn(game, "Llanowar Elves")]);
    attack(game, a, [loco]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});
