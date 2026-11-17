/**
 * A "−X" loyalty ability whose X is divided among any number of targets
 * (rules 107.3a, 602.2b, 601.2d): Huatli, Warrior Poet. The group is X big at
 * most, so the ability is offered once per X with that X fixed, and its
 * divided total is that X; the division is announced as it's activated, at
 * least 1 to each target. "Creatures dealt damage this way can't block this
 * turn" is the set the damage reached as it resolves (a `restrict` filter of
 * `thisWay: "dealt-damage"`, `asItResolves`), not every creature later.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, counters, life, loyalty, registryOf, settle, spawn, table, tokensNamed, zone } from "./harness.js";

type ActivateAbilityLegal = Extract<LegalAction, { kind: "activate-ability" }>;

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

const cantBlock = (game: Game, id: ObjectId): boolean => restrictionsOf(game.state, registryOf(game), id).has("cant-block");

/** Huatli's −X with X fixed at `x`, dealing `division` among `targets`. */
function minusX(game: Game, huatli: ObjectId, x: number, targets: readonly ObjectId[], division?: readonly number[]): void {
  game.dispatch({
    type: "activate-ability",
    player: A,
    source: huatli,
    abilityIndex: 2,
    targets: targets.map((object) => ({ kind: "object", object })),
    xValue: x,
    ...(division !== undefined ? { division } : {}),
  } as Action);
  settle(game);
}

describe("Huatli, Warrior Poet", () => {
  it("+2 gains life equal to the greatest power among your creatures", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    loyalty(game, huatli, 2);
    expect(life(game, A)).toBe(23);
    expect(counters(game, huatli, "loyalty")).toBe(5);
  });

  it("0 makes a 3/3 Dinosaur with trample", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    loyalty(game, huatli, 0);
    expect(tokensNamed(game, "Dinosaur Token")).toBe(1);
  });

  it("offers −X once per X, its divided total that X", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    spawn(game, "Grizzly Bears", B);
    const offers = game
      .legalActions(A)
      .filter((o): o is ActivateAbilityLegal => o.kind === "activate-ability" && o.source === huatli && o.loyalty === "-x");
    expect(offers.map((o) => [o.xCost?.minX ?? 0, o.xCost?.maxX, o.divide?.total])).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [2, 2, 2],
      [3, 3, 3],
    ]);
  });

  it("divides X as announced, and those dealt damage can't block this turn", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Craw Wurm", B);
    minusX(game, huatli, 3, [giant, bears], [1, 2]);
    expect(counters(game, huatli, "loyalty")).toBe(0);
    expect(damageOn(game, giant)).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(cantBlock(game, giant)).toBe(true);
    // Not dealt damage this way: it may block.
    expect(cantBlock(game, other)).toBe(false);
  });

  it("refuses more targets than X, and a share under 1", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => minusX(game, huatli, 1, [giant, bears])).toThrow();
    expect(() => minusX(game, huatli, 2, [giant, bears], [2, 0])).toThrow();
    expect(counters(game, huatli, "loyalty")).toBe(3);
  });

  it("a creature whose damage was prevented wasn't dealt damage this way (615.1)", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Warrior Poet");
    const giant = spawn(game, "Hill Giant", B);
    const shielded = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: "all" }, [
      { kind: "object", object: shielded },
    ]);
    minusX(game, huatli, 2, [giant, shielded], [1, 1]);
    expect(damageOn(game, shielded)).toBe(0);
    expect(cantBlock(game, shielded)).toBe(false);
    expect(cantBlock(game, giant)).toBe(true);
  });
});
