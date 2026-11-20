/**
 * "For each +1/+1 counter you put on a creature this way, remove a +1/+1
 * counter from that creature at the beginning of the next cleanup step"
 * (Bounty of the Hunt; Shambling Swarm's -1/-1 at the next end step): a
 * delayed trigger's `about: "counters-placed"` with `aboutPerCount`, one
 * target a counter put on, each losing one.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, enter, lands, nextTurn, pickTargets, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("Bounty of the Hunt", () => {
  it("takes off at cleanup exactly the counters it put on, each creature its own", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    cast(game, toHand(game, "Bounty of the Hunt"), { targets: [ref(bears), ref(giant)], division: [2, 1] });
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(2);
    toStep(game, "end");
    expect(counters(game, bears)).toBe(2);
    nextTurn(game);
    expect(counters(game, bears)).toBe(0);
    // Its own counter stays: only the one this put on comes off.
    expect(counters(game, giant)).toBe(1);
  });

  it("counts the counters a replacement added (Hardened Scales)", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    spawn(game, "Hardened Scales");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Bounty of the Hunt"), { targets: [ref(bears)], division: [3] });
    expect(counters(game, bears)).toBe(4);
    nextTurn(game);
    expect(counters(game, bears)).toBe(0);
  });

  it("can be cast by exiling a green card from hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, toHand(game, "Bounty of the Hunt"), { targets: [ref(bears)], division: [3], altCost: true });
    expect(counters(game, bears)).toBe(3);
    expect(game.state.objects[elves].zone).toBe("exile");
  });
});

describe("Shambling Swarm", () => {
  it("dying puts -1/-1 counters that come off at the next end step", () => {
    const { game, a } = table();
    const swarm = enter(game, "Shambling Swarm");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    destroy(game, swarm);
    expect(counters(game, wurm, "-1/-1")).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(game.state.turn.step).toBe("end");
    expect(counters(game, wurm, "-1/-1")).toBe(0);
  });
});
