import { describe, expect, it } from "vitest";

import { turnStatOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, counters, destroy, lands, life, named, pt, settle, spawn, table, toStep } from "./harness.js";
import type { Table } from "./harness.js";

/** `attackers` (alice's) declared at bob, stopped with their triggers done. */
function declare({ game, a }: Table, attackers: readonly ObjectId[]): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  toStep(game, "declare-attackers");
  settle(game);
}
const packPower = (game: Game): number => turnStatOf(game.state, A, "power-attacked-with-this-combat");

describe("pack tactics: the attackers' total power, as they were declared", () => {
  it("Gnoll Hunter: 6 together triggers it", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const friend = spawn(t.game, "Serra Angel");
    declare(t, [gnoll, friend]);
    expect(packPower(t.game)).toBe(6);
    expect(counters(t.game, gnoll)).toBe(1);
    expect(pt(t.game, gnoll).power).toBe(3);
  });

  it("5 doesn't, and a creature that stayed home doesn't count", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const friend = spawn(t.game, "Hill Giant");
    spawn(t.game, "Serra Angel");
    declare(t, [gnoll, friend]);
    expect(packPower(t.game)).toBe(5);
    expect(counters(t.game, gnoll)).toBe(0);
  });

  it("all of a token stack counts, every token in it", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const goblins = spawn(t.game, "Goblin Token");
    t.game.state.objects[goblins].stackCount = 4;
    declare(t, [gnoll, goblins]);
    expect(packPower(t.game)).toBe(6);
    expect(counters(t.game, gnoll)).toBe(1);
  });

  it("a pump after the declaration is too late to enable it", () => {
    const t = table();
    const goblin = spawn(t.game, "Battle Cry Goblin");
    const friend = spawn(t.game, "Hill Giant");
    lands(t.game, "Mountain", 2);
    declare(t, [goblin, friend]);
    expect(packPower(t.game)).toBe(5);
    activate(t.game, goblin, 0);
    expect(pt(t.game, goblin).power).toBe(3);
    expect(packPower(t.game)).toBe(5);
    expect(named(t.game, "Goblin Token")).toHaveLength(0);
  });

  it("the condition holds at resolution though the attackers have gone (rule 603.4)", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const friend = spawn(t.game, "Serra Angel");
    t.a.declareAttackersFn = () => [gnoll, friend].map((attacker) => ({ attacker, defender: B }));
    t.game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(t.game, friend);
    settle(t.game);
    expect(packPower(t.game)).toBe(6);
    expect(counters(t.game, gnoll)).toBe(1);
  });

  it("Battle Cry Goblin's token attacks, and adds nothing to what was declared (rule 508.4)", () => {
    const t = table();
    const goblin = spawn(t.game, "Battle Cry Goblin");
    const friend = spawn(t.game, "Serra Angel");
    declare(t, [goblin, friend]);
    const [token] = named(t.game, "Goblin Token");
    expect(t.game.state.objects[token].attacking).toBe(B);
    expect(t.game.state.objects[token].tapped).toBe(true);
    expect(packPower(t.game)).toBe(6);
  });

  it("an attacker with less than nothing counts as itself (rule 107.1b)", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const friend = spawn(t.game, "Serra Angel");
    const weak = spawn(t.game, "Ornithopter");
    const aura = spawn(t.game, "Weakness");
    t.game.state.objects[aura].attachedTo = weak;
    expect(pt(t.game, weak).power).toBe(-2);
    declare(t, [gnoll, friend, weak]);
    expect(packPower(t.game)).toBe(4);
    expect(counters(t.game, gnoll)).toBe(0);
  });

  it("this combat's: outside the combat, and in a later one with no attack, it's 0", () => {
    const t = table();
    const gnoll = spawn(t.game, "Gnoll Hunter");
    const friend = spawn(t.game, "Serra Angel");
    declare(t, [gnoll, friend]);
    expect(packPower(t.game)).toBe(6);
    toStep(t.game, "postcombat-main");
    expect(packPower(t.game)).toBe(0);
    t.game.state.turn.step = "begin-combat";
    t.game.state.turn.combatPhases = (t.game.state.turn.combatPhases ?? 1) + 1;
    expect(packPower(t.game)).toBe(0);
  });

  it("Targ Nar pumps every attacker, and its second ability doubles it", () => {
    const t = table();
    const targ = spawn(t.game, "Targ Nar, Demon-Fang Gnoll");
    const friend = spawn(t.game, "Serra Angel");
    const home = spawn(t.game, "Grizzly Bears");
    lands(t.game, "Taiga", 4);
    declare(t, [targ, friend]);
    expect(pt(t.game, targ)).toEqual({ power: 3, toughness: 2 });
    expect(pt(t.game, friend)).toEqual({ power: 5, toughness: 4 });
    expect(pt(t.game, home).power).toBe(2);
    activate(t.game, targ, 0);
    expect(pt(t.game, targ)).toEqual({ power: 6, toughness: 4 });
    toStep(t.game, "postcombat-main");
    expect(life(t.game, B)).toBe(9);
  });
});
