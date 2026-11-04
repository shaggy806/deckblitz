/**
 * "Each player puts a vow counter on a creature they control and sacrifices the
 * rest. Each of those creatures can't attack you or planeswalkers you control
 * for as long as it has a vow counter on it" — a keep's choice, then a
 * restriction bound to each kept creature for as long as a counter stays
 * (rule 611.2b), with "you" the spell's controller.
 *
 * Proving card: Promise of Loyalty.
 */

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  controller,
  counters,
  lands,
  named,
  pickPermanents,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const BEARS = "Grizzly Bears";
const LIONS = "Savannah Lions";

function promise(game: Game): void {
  lands(game, "Plains", 5);
  cast(game, toHand(game, "Promise of Loyalty"));
}

const why = (game: Game, who: PlayerId, attacker: ObjectId, target: PlayerId | ObjectId) =>
  whyCannotAttack(game.state, registryOf(game), who, attacker, target, { nextTurn: true });

describe("Promise of Loyalty", () => {
  it("each player, the caster too, keeps the creature they chose with a vow counter and sacrifices the rest", () => {
    const { game, a, b } = table();
    const keptA = spawn(game, BEARS, A);
    const lostA = spawn(game, LIONS, A);
    const keptB = spawn(game, BEARS, B);
    const lostB = spawn(game, LIONS, B);
    const askedA = pickPermanents(a, keptA);
    const askedB = pickPermanents(b, keptB);
    promise(game);
    expect(askedA.offered).toEqual(expect.arrayContaining([keptA, lostA]));
    expect(askedA.offered).not.toContain(keptB);
    expect(askedB.offered).toEqual(expect.arrayContaining([keptB, lostB]));
    for (const id of [keptA, keptB]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(counters(game, id, "vow")).toBe(1);
    }
    expect(zone(game, lostA)).toBe("graveyard");
    expect(zone(game, lostB)).toBe("graveyard");
  });

  it("asks nobody who has one creature, and nothing happens to a player with none", () => {
    const { game, a, b } = table();
    const only = spawn(game, BEARS, A);
    let asked = 0;
    const count = () => {
      asked += 1;
      return [];
    };
    a.choosePermanentsFn = count;
    b.choosePermanentsFn = count;
    const land = spawn(game, "Plains", B);
    promise(game);
    expect(asked).toBe(0);
    expect(counters(game, only, "vow")).toBe(1);
    // Only creatures are sacrificed, and a land gets no counter.
    expect(zone(game, land)).toBe("battlefield");
    expect(counters(game, land, "vow")).toBe(0);
  });

  it("leaves other permanents alone", () => {
    const { game, a } = table();
    const kept = spawn(game, BEARS, A);
    spawn(game, LIONS, A);
    const ring = spawn(game, "Sol Ring", A);
    pickPermanents(a, kept);
    promise(game);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("a vowed creature can't attack the caster or their planeswalkers, and may attack anyone else", () => {
    const { game } = table({ players: 3 });
    const bear = spawn(game, BEARS, B);
    const pw = spawn(game, "Jace Beleren", A);
    const others = spawn(game, "Jace Beleren", C);
    promise(game);
    expect(why(game, B, bear, A)).toMatch(/can't attack/);
    expect(why(game, B, bear, pw)).toMatch(/can't attack/);
    expect(why(game, B, bear, C)).toBeNull();
    expect(why(game, B, bear, others)).toBeNull();
  });

  it("names no battle: one the caster controls may still be attacked (rule 310.5)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const battle = toHand(game, "Invasion of Lorwyn");
    cast(game, battle);
    expect(game.state.objects[battle].protector).toBe(C);
    const bear = spawn(game, BEARS, B);
    promise(game);
    expect(why(game, B, bear, A)).toMatch(/can't attack/);
    expect(why(game, B, bear, battle)).toBeNull();
  });

  it("two casters' promises each bind it, for as long as one counter is left (rule 611.2b)", () => {
    const { game } = table({ players: 3 });
    const bear = spawn(game, BEARS, B);
    promise(game);
    toStep(game, "precombat-main", C);
    lands(game, "Plains", 5, C);
    cast(game, toHand(game, "Promise of Loyalty", C), { player: C });
    expect(counters(game, bear, "vow")).toBe(2);
    expect(why(game, B, bear, A)).toMatch(/can't attack/);
    expect(why(game, B, bear, C)).toMatch(/can't attack/);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "vow", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(why(game, B, bear, A)).toMatch(/can't attack/);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "vow", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(why(game, B, bear, A)).toBeNull();
    expect(why(game, B, bear, C)).toBeNull();
  });

  it("remembers its promise under another controller (the rulings)", () => {
    const { game } = table({ players: 3 });
    const bear = spawn(game, BEARS, B);
    promise(game);
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bear)]);
    settle(game);
    expect(controller(game, bear)).toBe(C);
    expect(why(game, C, bear, A)).toMatch(/can't attack/);
    expect(why(game, C, bear, B)).toBeNull();
  });

  it("the counter gone, it may attack, and a new counter doesn't bring the restriction back (rule 611.2b)", () => {
    const { game } = table();
    const bear = spawn(game, BEARS, B);
    promise(game);
    expect(why(game, B, bear, A)).toMatch(/can't attack/);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "vow", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(why(game, B, bear, A)).toBeNull();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "vow", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(why(game, B, bear, A)).toBeNull();
  });

  it("a counter moved to another creature doesn't bind that one (the rulings)", () => {
    const { game } = table();
    const bear = spawn(game, BEARS, B);
    promise(game);
    const other = spawn(game, LIONS, B);
    game.debugApplyEffect(A, { kind: "move-counters", from: 0, to: 1 }, [ref(bear), ref(other)]);
    settle(game);
    expect(counters(game, other, "vow")).toBe(1);
    expect(why(game, B, other, A)).toBeNull();
    expect(why(game, B, bear, A)).toBeNull();
  });

  it("no counter put on it, no restriction either (Solemnity; rule 611.2b)", () => {
    const { game } = table();
    spawn(game, "Solemnity", A);
    const bear = spawn(game, BEARS, B);
    promise(game);
    expect(zone(game, bear)).toBe("battlefield");
    expect(counters(game, bear, "vow")).toBe(0);
    expect(why(game, B, bear, A)).toBeNull();
  });

  it("one token of a stack kept: it alone stays, vowed", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 9 });
    const stack = named(game, "Soldier Token", A)[0];
    expect(game.state.objects[stack].stackCount).toBe(9);
    pickPermanents(a, stack);
    promise(game);
    const left = named(game, "Soldier Token", A);
    expect(left).toHaveLength(1);
    expect(game.state.objects[left[0]].stackCount ?? 1).toBe(1);
    expect(counters(game, left[0], "vow")).toBe(1);
  });
});
