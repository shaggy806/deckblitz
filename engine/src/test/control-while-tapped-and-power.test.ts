/**
 * Control "for as long as this creature remains tapped **and** that
 * creature's power remains less than or equal to this creature's power" (Old
 * Man of the Sea; rule 611.2b): `gain-control`'s `whileSourceTapped` and
 * `whileIt` on one effect, the filter reading "this creature" as the
 * `WhileSource` permanent, live. It ends the first moment either stops
 * holding, for good.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, controller, ref, settle, spawn, table } from "./harness.js";

const pump = (game: Game, id: ObjectId, n: number, by = B): void => {
  game.debugApplyEffect(by, { kind: "modify-pt", target: 0, power: n, toughness: n, duration: "end-of-turn" }, [ref(id)]);
  settle(game);
};

const steal = (game: Game, oldMan: ObjectId, target: ObjectId): void => {
  activate(game, oldMan, 0, { targets: [ref(target)] });
};

describe("Old Man of the Sea", () => {
  it("takes a creature with power no greater than its own while it stays tapped", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, oldMan, bears);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[oldMan].tapped).toBe(true);
  });

  it("can't target a creature with greater power", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => steal(game, oldMan, giant)).toThrow();
    expect(controller(game, giant)).toBe(B);
  });

  it("hands it back once its power goes above the Old Man's — for good", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, oldMan, bears);
    pump(game, bears, 1);
    expect(controller(game, bears)).toBe(B);
    // Smaller again: the effect has ended.
    pump(game, oldMan, 5, A);
    expect(controller(game, bears)).toBe(B);
  });

  it("keeps it while the Old Man grows with it", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, oldMan, bears);
    pump(game, oldMan, 2, A);
    pump(game, bears, 2);
    expect(controller(game, bears)).toBe(A);
  });

  it("hands it back as the Old Man untaps", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, oldMan, bears);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(oldMan)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("hands it back as the Old Man's power drops below it", () => {
    const { game } = table();
    const oldMan = spawn(game, "Old Man of the Sea", A);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, oldMan, bears);
    pump(game, oldMan, -1);
    expect(controller(game, bears)).toBe(B);
  });
});
