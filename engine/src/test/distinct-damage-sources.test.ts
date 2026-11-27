/**
 * "Three or more sources you controlled dealt damage this turn" (Case of the
 * Burning Masks): the `turn-history` view `"dealt-damage"`, each source once
 * (per stint, rule 400.7) however often it dealt damage, in the list of its
 * controller as it dealt it.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { journalCount } from "../characteristics.js";
import { A, B, activate, attack, cast, graveyard, lands, pickTargets, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const solved = (game: Game, id: ObjectId): boolean => game.state.objects[id].solved === true;
const sources = (game: Game): number => journalCount(game.state, game.registry, [A], "dealt-damage", undefined, A);

const castCase = (game: Game, a: Parameters<typeof pickTargets>[0]): ObjectId => {
  const giant = spawn(game, "Hill Giant", B);
  lands(game, "Mountain", 3);
  pickTargets(a, giant);
  const id = toHand(game, "Case of the Burning Masks");
  cast(game, id);
  settle(game);
  expect(zone(game, giant)).toBe("graveyard");
  return id;
};

describe("Case of the Burning Masks", () => {
  it("its enter trigger deals 3 damage to an opponent's creature, and it is one source", () => {
    const { game, a } = table();
    castCase(game, a);
    expect(sources(game)).toBe(1);
  });

  it("solves with three sources: itself and two Shocks", () => {
    const { game, a } = table();
    const id = castCase(game, a);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    expect(sources(game)).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(solved(game, id)).toBe(true);
  });

  it("a double striker dealing damage twice is one source: two sources don't solve it", () => {
    const { game, a } = table();
    const ace = spawn(game, "Fencing Ace");
    const id = castCase(game, a);
    attack(game, a, [ace]);
    expect(game.state.players[B].life).toBe(18);
    expect(sources(game)).toBe(2);
    toStep(game, "end");
    settle(game);
    expect(solved(game, id)).toBe(false);
  });

  it("solved, sacrificing it exiles the top three cards", () => {
    const { game, a } = table();
    const id = castCase(game, a);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    toStep(game, "end");
    settle(game);
    expect(solved(game, id)).toBe(true);
    const exiled = game.state.zones.shared.exile.length;
    activate(game, id);
    settle(game);
    expect(graveyard(game)).toContain(id);
    expect(game.state.zones.shared.exile.length).toBe(exiled + 3);
  });
});
