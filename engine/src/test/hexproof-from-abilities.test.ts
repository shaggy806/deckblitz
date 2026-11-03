/**
 * "Hexproof from activated and triggered abilities" (Volatile Stormdrake —
 * rule 702.11d, a hexproof ability that a loss of hexproof takes, 702.11e)
 * against "can't be the target of abilities your opponents control"
 * (Shanna, Sisay's Legacy — not hexproof, so it stays through Shadowspear).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, pt, ref, spawn, table, toHand, zone, controller } from "./harness.js";

const canAbilityTarget = (game: Game, pyromancer: ObjectId, target: ObjectId): boolean =>
  game.canDispatch({ type: "activate-ability", player: A, source: pyromancer, abilityIndex: 0, targets: [ref(target)] }) === null;

describe("hexproof from abilities", () => {
  it("Volatile Stormdrake: an opponent's ability can't target it, a spell can, and its own controller's can", () => {
    const { game } = table();
    const drake = spawn(game, "Volatile Stormdrake", B);
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    expect(canAbilityTarget(game, pyromancer, drake)).toBe(false);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
    const mine = spawn(game, "Volatile Stormdrake");
    expect(canAbilityTarget(game, pyromancer, mine)).toBe(true);
  });

  it("Shadowspear takes Stormdrake's hexproof from abilities but not Shanna's restriction", () => {
    const { game } = table();
    const drake = spawn(game, "Volatile Stormdrake", B);
    const shanna = spawn(game, "Shanna, Sisay's Legacy", B);
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    const spear = spawn(game, "Shadowspear");
    expect(canAbilityTarget(game, pyromancer, shanna)).toBe(false);
    lands(game, "Wastes", 1);
    activate(game, spear, 0);
    expect(canAbilityTarget(game, pyromancer, drake)).toBe(true);
    expect(canAbilityTarget(game, pyromancer, shanna)).toBe(false);
  });

  it("Shanna gets +1/+1 for each creature you control", () => {
    const { game } = table();
    const shanna = spawn(game, "Shanna, Sisay's Legacy");
    spawn(game, "Grizzly Bears");
    expect(pt(game, shanna)).toEqual({ power: 2, toughness: 2 });
  });

  it("Volatile Stormdrake enters: control exchanged, four energy, the creature kept by paying its mana value", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    a.chooseModesFn = () => [0]; // pay the energy
    const drake = game.debugSpawn("Volatile Stormdrake", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(controller(game, drake)).toBe(B);
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.players[A].energy).toBe(2);
  });

  it("Volatile Stormdrake: declined, the gained creature is sacrificed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    a.chooseModesFn = () => [];
    game.debugSpawn("Volatile Stormdrake", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
