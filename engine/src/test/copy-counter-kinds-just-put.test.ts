/**
 * "Put one of each of those kinds of counters": `put-counters-of`'s
 * `oneOfEach` over the placement that fired a `counters-put` trigger
 * (`"trigger-placement"`: every kind put on the permanent at once, rule
 * 603.2c, one trigger). Aragorn, Company Leader: "Whenever you put one or more
 * counters on Aragorn, put one of each of those kinds of counters on up to one
 * other target creature", fed by "whenever the Ring tempts you, if you chose a
 * creature other than Aragorn as your Ring-bearer, put your choice of a
 * counter from among first strike, vigilance, deathtouch, and lifelink on
 * Aragorn".
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, pickModes, pickTargets, ref, settle, spawn, table } from "./harness.js";

describe("Aragorn, Company Leader", () => {
  it("the Ring tempting you onto another creature puts the counter you choose on Aragorn, and one like it on another creature", () => {
    const { game, a } = table();
    const aragorn = spawn(game, "Aragorn, Company Leader");
    const bears = spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [bears];
    pickModes(a, 2);
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(counters(game, aragorn, "deathtouch")).toBe(1);
    expect(counters(game, bears, "deathtouch")).toBe(1);
  });

  it("puts nothing on Aragorn when you choose Aragorn as your Ring-bearer", () => {
    const { game, a } = table();
    const aragorn = spawn(game, "Aragorn, Company Leader");
    a.choosePermanentsFn = () => [aragorn];
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(counters(game, aragorn, "first-strike")).toBe(0);
  });

  it("puts one of each kind, not as many, and one trigger for kinds put at once", () => {
    const { game, a } = table();
    const aragorn = spawn(game, "Aragorn, Company Leader");
    const bears = spawn(game, "Grizzly Bears");
    const donor = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(donor)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 }, [ref(donor)]);
    pickTargets(a, null);
    settle(game);
    pickTargets(a, bears);
    // Three +1/+1 counters: one goes on the Bears.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(aragorn)]);
    settle(game);
    expect(counters(game, bears)).toBe(1);
    // Two kinds at once, one placement: a single trigger, one of each.
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [{ kind: "object", object: bears }];
    };
    game.debugApplyEffect(A, { kind: "put-counters-of", of: 0, target: 1 }, [ref(donor), ref(aragorn)]);
    settle(game);
    expect(asked).toBe(1);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, bears, "lifelink")).toBe(1);
  });

  it("doesn't trigger on counters an opponent puts on Aragorn", () => {
    const { game, a } = table();
    const aragorn = spawn(game, "Aragorn, Company Leader");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(aragorn)]);
    settle(game);
    expect(counters(game, aragorn)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});
