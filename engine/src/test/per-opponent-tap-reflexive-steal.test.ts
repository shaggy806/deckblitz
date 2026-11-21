/**
 * "For each opponent, tap up to one untapped creature you control. When you
 * do, gain control of target creature that player controls with power less
 * than or equal to the tapped creature's power" (rules 101.4, 603.12): a
 * `for-each-player` of `choicesHeld` whose `tap` is `atRelease` — one
 * creature chosen for each opponent in turn, none chosen twice, all tapped at
 * once (one tapping) — and a reflexive ability per creature tapped, "that
 * player" the opponent it was chosen for, the tapped creature's power read as
 * it last existed (608.2h). And "whenever you attack with a creature an
 * opponent owns", "that player" its owner.
 *
 * Cards: Nihiloor.
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, attack, controller, counters, enter, life, ref, spawn, table } from "./harness.js";

/** The seat chooses `picks` in order, one per choose-permanents question. */
function pickInTurn(seat: ScriptedController, ...picks: readonly (ObjectId | null)[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  let i = 0;
  seat.choosePermanentsFn = (_view, eligible) => {
    seen.offered.push(eligible);
    const pick = picks[i++];
    return pick === null || pick === undefined ? [] : [pick];
  };
  return seen;
}

/** Each target question is answered with the first of `wanted` it offers. */
function targetAmong(seat: ScriptedController, ...wanted: readonly ObjectId[]): { offered: (readonly (ObjectId | PlayerId)[])[] } {
  const seen = { offered: [] as (readonly (ObjectId | PlayerId)[])[] };
  seat.chooseTargetsFn = (_view, _name, _specs, legal) => {
    const offered = (legal[0] ?? []).map((t) => (t.kind === "object" ? t.object : t.player));
    seen.offered.push(offered);
    const hit = wanted.find((id) => offered.includes(id));
    return [hit === undefined ? null : ref(hit)];
  };
  return seen;
}

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Nihiloor", () => {
  it("one creature for each opponent; each steals a creature of that opponent's with no more power", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant"); // 3/3
    const bears = spawn(game, "Grizzly Bears"); // 2/2
    const theirGiant = spawn(game, "Hill Giant", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    const carolsGiant = spawn(game, "Hill Giant", C);
    const carolsElves = spawn(game, "Llanowar Elves", C);
    // A second legal choice for Carol, so the target is asked, not taken.
    const carolsBears = spawn(game, "Grizzly Bears", C);
    // Bob's is chosen first (turn order), then Carol's.
    const asked = pickInTurn(a, giant, bears);
    const seen = targetAmong(a, theirGiant, carolsGiant, carolsElves);
    enter(game, "Nihiloor");
    expect(asked.offered).toHaveLength(2);
    // The creature chosen for Bob isn't offered again for Carol, though it's
    // still untapped until both are chosen.
    expect(asked.offered[1]).not.toContain(giant);
    expect(tapped(game, giant)).toBe(true);
    expect(tapped(game, bears)).toBe(true);
    // Bob's: power 3 or less; Carol's: power 2 or less (not her Hill Giant).
    expect(seen.offered).toHaveLength(2);
    const [first, second] = seen.offered;
    const bobs = first.includes(theirGiant) ? first : second;
    const carols = bobs === first ? second : first;
    expect(bobs).toEqual(expect.arrayContaining([theirGiant, theirBears]));
    expect(bobs).not.toContain(carolsElves);
    expect(carols).toEqual(expect.arrayContaining([carolsElves, carolsBears]));
    expect(carols).not.toContain(carolsGiant);
    expect(carols).not.toContain(theirBears);
    expect(controller(game, theirGiant)).toBe(A);
    expect(controller(game, carolsElves)).toBe(A);
    expect(controller(game, carolsGiant)).toBe(C);
  });

  it("the creatures are tapped at once: a batched 'become tapped' trigger fires once", () => {
    const { game, a } = table({ players: 3 });
    const history = spawn(game, "Rewrite History");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    pickInTurn(a, giant, bears);
    targetAmong(a);
    enter(game, "Nihiloor");
    expect(tapped(game, giant)).toBe(true);
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, history, "plan")).toBe(1);
  });

  it("none tapped for an opponent: nothing triggers for them", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    spawn(game, "Llanowar Elves", C);
    pickInTurn(a, null, giant);
    const seen = targetAmong(a, carols);
    enter(game, "Nihiloor");
    expect(seen.offered).toHaveLength(1);
    expect(tapped(game, giant)).toBe(true);
    expect(controller(game, carols)).toBe(A);
  });

  it("control lasts only while you control Nihiloor", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickInTurn(a, giant);
    targetAmong(a, theirs);
    const nihiloor = enter(game, "Nihiloor");
    expect(controller(game, theirs)).toBe(A);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(nihiloor)]);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(controller(game, theirs)).toBe(B);
  });

  it("Nihiloor gone before the reflexive ability resolves: no control is gained", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickInTurn(a, giant);
    targetAmong(a, theirs);
    const nihiloor = enter(game, "Nihiloor", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined));
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(nihiloor)]);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(controller(game, theirs)).toBe(B);
  });

  it("the tapped creature's power is read as it last existed once it's gone", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    pickInTurn(a, giant);
    targetAmong(a, theirs);
    // With the reflexive ability on the stack, the tapped Giant is destroyed
    // in response: its 3 power is read as it last existed.
    enter(game, "Nihiloor", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined));
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(giant)]);
    expect(game.state.objects[giant].zone).toBe("graveyard");
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(controller(game, theirs)).toBe(A);
  });

  it("attacking with a creature an opponent owns: you gain 2, its owner loses 2", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Nihiloor");
    const bobs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bobs)]);
    game.state.objects[bobs].summoningSick = false;
    attack(game, a, [bobs, mine], C);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(16);
  });
});
