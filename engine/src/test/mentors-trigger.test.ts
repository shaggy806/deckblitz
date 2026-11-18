/**
 * "Whenever equipped creature mentors a creature" (rule 702.134c — Aegis of
 * the Legion): the `mentors` trigger event over `mentored`, announced as a
 * mentor ability (`keywordOf: "mentor"`, printed or granted) resolves with its
 * target still legal. The subject is the mentor ability's source; the
 * creature mentored is the recipient ("that creature"). Whether the Equipment
 * is on that creature is asked as the ability resolves (the rulings).
 */

import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards/generated.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, counters, pt, ref, settle, spawn, table, toStep } from "./harness.js";

/** Attach the Aegis to `creature` — settled, unless something waits on the stack. */
const equip = (game: Game, aegis: ObjectId, creature: ObjectId, andSettle = true): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(creature)], { source: aegis });
  if (andSettle) settle(game);
};
/** Declare `attackers` at bob and stop with the attack triggers on the stack. */
const declare = (game: Game, a: ScriptedController, attackers: readonly ObjectId[]): void => {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder !== null);
};
const shields = (game: Game, id: ObjectId): number => counters(game, id, "shield");

describe("mentors — Aegis of the Legion", () => {
  it("equipped creature gets +1/+1 and mentor; the creature it mentors gets a shield counter", () => {
    const { game, a } = table();
    const aegis = spawn(game, "Aegis of the Legion");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    equip(game, aegis, bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [bears, lions]);
    expect(counters(game, lions)).toBe(1);
    expect(shields(game, lions)).toBe(1);
    expect(shields(game, bears)).toBe(0);
    expect(game.eventsOfType("mentored").map((e) => [e.object, e.target])).toEqual([[bears, lions]]);
  });

  it("its own printed mentor counts too, and a mentor whose target is no longer of lesser power mentors no one", () => {
    const { game, a } = table();
    const aegis = spawn(game, "Aegis of the Legion");
    const instructor = spawn(game, "Blade Instructor");
    const giant = spawn(game, "Hill Giant");
    equip(game, aegis, instructor);
    // 4/2 with two mentors, both at the 3/3 giant: the first makes it 4/4,
    // so the second's target is illegal as it resolves (the ruling).
    attack(game, a, [instructor, giant]);
    expect(counters(game, giant)).toBe(1);
    expect(shields(game, giant)).toBe(1);
    expect(game.eventsOfType("mentored")).toHaveLength(1);
  });

  it("two mentors that both resolve: two shield counters", () => {
    const { game, a } = table();
    const aegis = spawn(game, "Aegis of the Legion");
    const instructor = spawn(game, "Blade Instructor");
    const elves = spawn(game, "Llanowar Elves");
    equip(game, aegis, instructor);
    attack(game, a, [instructor, elves]);
    expect(counters(game, elves)).toBe(2);
    expect(shields(game, elves)).toBe(2);
  });

  it("an unequipped creature's mentor triggers nothing", () => {
    const { game, a } = table();
    spawn(game, "Aegis of the Legion");
    const instructor = spawn(game, "Blade Instructor");
    const elves = spawn(game, "Llanowar Elves");
    attack(game, a, [instructor, elves]);
    expect(counters(game, elves)).toBe(1);
    expect(shields(game, elves)).toBe(0);
  });

  it("moved off before the mentor ability resolves: no shield counter", () => {
    const { game, a } = table();
    const aegis = spawn(game, "Aegis of the Legion");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const other = spawn(game, "Grizzly Bears");
    equip(game, aegis, bears);
    declare(game, a, [bears, elves]);
    equip(game, aegis, other, false);
    toStep(game, "postcombat-main");
    // Still 2 power against the elves' 1: the mentor ability resolved.
    expect(counters(game, elves)).toBe(1);
    expect(shields(game, elves)).toBe(0);
  });

  it("moved onto the mentor's source before it resolves: a shield counter", () => {
    const { game, a } = table();
    const aegis = spawn(game, "Aegis of the Legion");
    const instructor = spawn(game, "Blade Instructor");
    const elves = spawn(game, "Llanowar Elves");
    declare(game, a, [instructor, elves]);
    equip(game, aegis, instructor, false);
    toStep(game, "postcombat-main");
    expect(counters(game, elves)).toBe(1);
    expect(shields(game, elves)).toBe(1);
  });

  it("every pool card with mentor marks its mentor ability `keywordOf: \"mentor\"`", () => {
    const line = "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)";
    let checked = 0;
    for (const def of POOL_CARDS) {
      if (!def.text.includes(line)) continue;
      const own = def.triggered.filter((t) => t.text === line);
      expect(own.length, def.name).toBe(1);
      expect(own[0].keywordOf, def.name).toBe("mentor");
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });
});
