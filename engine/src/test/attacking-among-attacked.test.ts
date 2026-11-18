/**
 * Tahngarth, First Mate: "you may have that opponent gain control of
 * Tahngarth until end of combat. If you do, choose a player or planeswalker
 * that opponent is attacking. Tahngarth is attacking that player or
 * planeswalker." — `gain-control` `until: "until-end-of-combat"` (ended at
 * the end of the combat phase, rule 500.5a) and `is-attacking` `at: {
 * amongAttacked: true }`: the effect's controller chooses among the players
 * and planeswalkers the other attackers are attacking (rule 508.4, the
 * rulings).
 */
import { describe, expect, it } from "vitest";

import type { EnterAttackingChoice } from "../state.js";
import { A, B, C, controller, life, nextTurn, pickModes, spawn, table, toStep } from "./harness.js";

describe("Tahngarth, First Mate", () => {
  it("goes to the attacking opponent until end of combat, attacking what you choose among what they attack", () => {
    const { game, a, b } = table({ players: 3 });
    const tahngarth = spawn(game, "Tahngarth, First Mate", A, { tapped: true });
    const atAlice = spawn(game, "Grizzly Bears", B);
    const atCarol = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(a, 0);
    const offered: EnterAttackingChoice[][] = [];
    a.chooseAttackTargetsFn = (_view, creatures) => {
      offered.push([...creatures]);
      return creatures.map((c) => ({ object: c.object, target: C }));
    };
    b.declareAttackersFn = () => [
      { attacker: atAlice, defender: A },
      { attacker: atCarol, defender: C },
    ];
    toStep(game, "declare-blockers", B);
    expect(offered).toHaveLength(1);
    expect(offered[0].map((c) => c.object)).toEqual([tahngarth]);
    expect([...offered[0][0].options].sort()).toEqual([A, C].sort());
    expect(controller(game, tahngarth)).toBe(B);
    expect(game.state.objects[tahngarth].attacking).toBe(C);
    toStep(game, "postcombat-main", B);
    expect(life(game, C)).toBe(20 - 2 - 5);
    expect(life(game, A)).toBe(20 - 2);
    // Back to alice once combat is over, still tapped.
    expect(controller(game, tahngarth)).toBe(A);
    expect(game.state.objects[tahngarth].tapped).toBe(true);
    expect(game.state.objects[tahngarth].attacking).toBeNull();
  });

  it("can attack its owner", () => {
    const { game, a, b } = table({ players: 3 });
    const tahngarth = spawn(game, "Tahngarth, First Mate", A, { tapped: true });
    const atAlice = spawn(game, "Grizzly Bears", B);
    const atCarol = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(a, 0);
    a.chooseAttackTargetsFn = (_view, creatures) => creatures.map((c) => ({ object: c.object, target: A }));
    b.declareAttackersFn = () => [
      { attacker: atAlice, defender: A },
      { attacker: atCarol, defender: C },
    ];
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(20 - 2 - 5);
    expect(controller(game, tahngarth)).toBe(A);
  });

  it("only a planeswalker attacked, not its controller: that planeswalker, asked of nobody", () => {
    const { game, a, b } = table({ players: 3 });
    const tahngarth = spawn(game, "Tahngarth, First Mate", A, { tapped: true });
    const walker = spawn(game, "Jace Beleren", C);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(a, 0);
    let asked = false;
    a.chooseAttackTargetsFn = (_view, creatures) => {
      asked = true;
      return creatures.map((c) => ({ object: c.object, target: c.options[0] }));
    };
    b.declareAttackersFn = () => [{ attacker: bears, defender: walker }];
    toStep(game, "declare-blockers", B);
    expect(asked).toBe(false);
    expect(game.state.objects[tahngarth].attacking).toBe(walker);
  });

  it("untapped, it doesn't trigger; declined, nothing changes hands", () => {
    const untapped = table();
    const fresh = spawn(untapped.game, "Tahngarth, First Mate", A);
    const bears = spawn(untapped.game, "Grizzly Bears", B);
    nextTurn(untapped.game);
    let asked = false;
    untapped.a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    untapped.b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(untapped.game, "declare-blockers", B);
    expect(asked).toBe(false);
    expect(controller(untapped.game, fresh)).toBe(A);

    const declined = table();
    const tapped = spawn(declined.game, "Tahngarth, First Mate", A, { tapped: true });
    const other = spawn(declined.game, "Grizzly Bears", B);
    nextTurn(declined.game);
    pickModes(declined.a);
    declined.b.declareAttackersFn = () => [{ attacker: other, defender: A }];
    toStep(declined.game, "declare-blockers", B);
    expect(controller(declined.game, tapped)).toBe(A);
    expect(declined.game.state.objects[tapped].attacking).toBeNull();
  });

  it("a bot choosing for it sends it at another opponent rather than at itself", () => {
    const { game, a, b } = table({ players: 3 });
    const tahngarth = spawn(game, "Tahngarth, First Mate", A, { tapped: true });
    const atAlice = spawn(game, "Grizzly Bears", B);
    const atCarol = spawn(game, "Grizzly Bears", B);
    // Alice has the least life, so "the lowest life" alone would pick her.
    game.state.players[A].life = 5;
    nextTurn(game);
    pickModes(a, 0);
    b.declareAttackersFn = () => [
      { attacker: atAlice, defender: A },
      { attacker: atCarol, defender: C },
    ];
    toStep(game, "declare-blockers", B);
    expect(game.state.objects[tahngarth].attacking).toBe(C);
  });
});
