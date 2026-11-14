/**
 * A voter choosing a permanent for each of their votes (`for-each-vote`
 * around a `choose-permanents` with `chooser: "that-player"` and
 * `thenTogether`), and one instruction over every one chosen this way —
 * Elrond of the White Council: "For each fellowship vote, the voter chooses a
 * creature they control. You gain control of each creature chosen this way,
 * and they gain 'This creature can't attack its owner.' Then for each aid
 * vote, put a +1/+1 counter on each creature you control."
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, controller, counters, enter, named, pickModes, registryOf, spawn, table, tokensNamed } from "./harness.js";

const ELROND = "Elrond of the White Council";

describe("Elrond of the White Council", () => {
  it("each fellowship voter gives up a creature they choose; each aid vote is a counter on each of yours", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobGiant = spawn(game, "Hill Giant", B);
    const carolAngel = spawn(game, "Serra Angel", C);
    const mine = spawn(game, "Grizzly Bears", A);
    pickModes(a, 1);
    pickModes(b, 0);
    pickModes(c, 0);
    const offered: Record<string, readonly ObjectId[]> = {};
    b.choosePermanentsFn = (_view, eligible) => {
      offered.b = eligible;
      return [bobGiant];
    };
    c.choosePermanentsFn = (_view, eligible) => {
      offered.c = eligible;
      return [carolAngel];
    };
    a.choosePermanentsFn = () => {
      throw new Error("an aid voter chooses nothing");
    };
    const elrond = enter(game, ELROND);
    // Each voter chose among their own creatures.
    expect(new Set(offered.b)).toEqual(new Set([bobBears, bobGiant]));
    expect(offered.c).toEqual([carolAngel]);
    expect(controller(game, bobGiant)).toBe(A);
    expect(controller(game, carolAngel)).toBe(A);
    expect(controller(game, bobBears)).toBe(B);
    // One aid vote: one counter on each creature you control — the new ones too.
    for (const id of [elrond, mine, bobGiant, carolAngel]) expect(counters(game, id, "+1/+1")).toBe(1);
    expect(counters(game, bobBears, "+1/+1")).toBe(0);
    // They gained "This creature can't attack its owner."
    for (const id of [bobGiant, carolAngel]) game.state.objects[id].summoningSick = false;
    game.state.objects[mine].summoningSick = false;
    const why = (creature: ObjectId, at: typeof B): string | null =>
      whyCannotAttack(game.state, registryOf(game), A, creature, at);
    expect(why(bobGiant, B)).toContain("its owner");
    expect(why(bobGiant, C)).toBeNull();
    expect(why(carolAngel, C)).toContain("its owner");
    expect(why(carolAngel, B)).toBeNull();
    expect(why(mine, B)).toBeNull();
  });

  it("a voter with two fellowship votes may choose the same creature each time (the ruling)", () => {
    const { game, a, b } = table();
    spawn(game, "Ballot Broker", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickModes(b, 0);
    let asked = 0;
    b.choosePermanentsFn = (_view, eligible) => {
      asked += 1;
      expect(eligible).toContain(bears);
      return [bears];
    };
    enter(game, ELROND);
    expect(asked).toBe(2);
    expect(controller(game, bears)).toBe(A);
  });

  it("all aid: no one chooses, and a counter per vote", () => {
    const { game, a, b } = table();
    pickModes(a, 1);
    pickModes(b, 1);
    const bears = spawn(game, "Grizzly Bears", B);
    b.choosePermanentsFn = () => {
      throw new Error("nobody voted fellowship");
    };
    const elrond = enter(game, ELROND);
    expect(counters(game, elrond, "+1/+1")).toBe(2);
    expect(controller(game, bears)).toBe(B);
    expect(counters(game, bears, "+1/+1")).toBe(0);
  });

  it("a fellowship voter with no creature chooses nothing", () => {
    const { game, a, b } = table();
    pickModes(a, 1);
    pickModes(b, 0);
    const elrond = enter(game, ELROND);
    expect(controller(game, elrond)).toBe(A);
    expect(counters(game, elrond, "+1/+1")).toBe(1);
  });

  it("a token chosen from a stack is that one token, not the stack", () => {
    const { game, a, b } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [stack] = named(game, "Soldier Token", B);
    game.state.objects[stack!].stackCount = 3;
    expect(tokensNamed(game, "Soldier Token", B)).toBe(3);
    pickModes(a, 1);
    pickModes(b, 0);
    b.choosePermanentsFn = (_view, eligible) => [eligible.find((id) => game.state.objects[id].cardName === "Soldier Token")!];
    enter(game, ELROND);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(2);
    const [stolen] = named(game, "Soldier Token", A);
    expect(counters(game, stolen!, "+1/+1")).toBe(1);
  });
});
