/**
 * "Whenever you cast an instant or sorcery spell that targets only ~ or
 * activate an ability that targets only ~, copy that spell or ability"
 * (Bill Potts): a `cast-spell` trigger filtered on `targets: { only, source }`
 * and an `activates-ability` trigger with the same `targets` clause, joined
 * by `sameAbilityAs` into the one ability they are, so "This ability
 * triggers only once each turn" (rule 603.2) covers both.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, nextTurn, pt, ref, spawn, table, toHand } from "./harness.js";

describe("Bill Potts", () => {
  it("copies an instant that targets only Bill", () => {
    const { game } = table();
    const bill = spawn(game, "Bill Potts");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bill)] });
    expect(game.eventsOfType("spell-copied")).toHaveLength(1);
    expect(pt(game, bill)).toEqual({ power: 8, toughness: 10 });
  });

  it("copies an ability that targets only Bill", () => {
    const { game } = table();
    const bill = spawn(game, "Bill Potts");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(bill)] });
    expect(game.eventsOfType("ability-copied")).toHaveLength(1);
    expect(game.state.objects[bill].damageMarked).toBe(2);
  });

  it("triggers only once each turn, across spells and abilities", () => {
    const { game } = table();
    const bill = spawn(game, "Bill Potts");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bill)] });
    activate(game, pyromancer, 0, { targets: [ref(bill)] });
    expect(game.eventsOfType("spell-copied")).toHaveLength(1);
    expect(game.eventsOfType("ability-copied")).toHaveLength(0);
    nextTurn(game);
    nextTurn(game);
    const pyro2 = spawn(game, "Prodigal Pyromancer");
    activate(game, pyro2, 0, { targets: [ref(bill)] });
    expect(game.eventsOfType("ability-copied")).toHaveLength(1);
  });

  it("ignores a spell or ability that targets anything else too, and an opponent's", () => {
    const { game } = table();
    const bill = spawn(game, "Bill Potts");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(B)] });
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(game.eventsOfType("ability-copied")).toHaveLength(0);
    expect(game.eventsOfType("spell-copied")).toHaveLength(0);
    const theirs = spawn(game, "Prodigal Pyromancer", B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, theirs, 0, { player: B, targets: [ref(bill)] });
    expect(game.eventsOfType("ability-copied")).toHaveLength(0);
  });
});
