/**
 * A granted ability whose counters live on the permanent granting it (rule
 * 201.5a): "Put an aim counter on Hankyu" is `add-counter` on `"granter"`,
 * and "Remove all aim counters from Hankyu" is `removeCounter: { count:
 * "all", granter: true }`, the number removed the ability's X (601.2h, via
 * 602.2b) — payable with none (118.3).
 *
 * Proving card: Hankyu.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, life, ref, spawn, table } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const equipTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.state.objects[equipment].attachedTo = creature;
};
const untap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "untap", target: 0 }, [{ kind: "object", object: id }]);
};

describe("counters on the granting Equipment", () => {
  it("Hankyu: aim counters go on Hankyu, and come off all at once for that much damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const hankyu = spawn(game, "Hankyu", A);
    equipTo(game, hankyu, bears);
    activate(game, bears, 0);
    expect(counters(game, hankyu, "aim")).toBe(1);
    expect(counters(game, bears, "aim")).toBe(0);
    untap(game, bears);
    activate(game, bears, 0);
    untap(game, bears);
    expect(counters(game, hankyu, "aim")).toBe(2);
    activate(game, bears, 1, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(18);
    expect(counters(game, hankyu, "aim")).toBe(0);
  });

  it("with no aim counters it can still be activated, for no damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const hankyu = spawn(game, "Hankyu", A);
    equipTo(game, hankyu, bears);
    const target = spawn(game, "Grizzly Bears", B);
    activate(game, bears, 1, { targets: [ref(target)] });
    expect(game.state.objects[target].damageMarked).toBe(0);
  });

  it("the counters stay on Hankyu when it moves to another creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const hankyu = spawn(game, "Hankyu", A);
    equipTo(game, hankyu, bears);
    activate(game, bears, 0);
    equipTo(game, hankyu, elves);
    // The Elves' own {T}: Add {G} is ability 0; the granted ones follow.
    activate(game, elves, 2, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(19);
    expect(counters(game, hankyu, "aim")).toBe(0);
  });
});
