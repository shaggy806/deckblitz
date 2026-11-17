/**
 * "If a modular triggered ability would put one or more +1/+1 counters on a
 * creature you control, that many plus one … instead" (Zabaz, the
 * Glimmerwasp): a `would-add-counter` replacement narrowed by
 * `byKeywordAbility` to the triggered half of modular (rule 702.43a), read
 * from the ability resolving as the counters are put — across its "you may".
 */
import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards.js";
import { A, B, counters, destroy, enter, pickModes, pickTargets, ref, table } from "./harness.js";

describe("Zabaz, the Glimmerwasp", () => {
  it("adds one to the counters a modular ability puts on a creature you control", () => {
    const { game, a } = table();
    enter(game, "Zabaz, the Glimmerwasp");
    const worker = enter(game, "Arcbound Worker");
    const ravager = enter(game, "Arcbound Ravager");
    pickTargets(a, ravager);
    pickModes(a, 0);
    destroy(game, worker);
    // The Ravager's own 1, and the Worker's 1 plus one.
    expect(counters(game, ravager)).toBe(3);
  });

  it("leaves a modular permanent's enters-with counters, and other effects' counters, alone", () => {
    const { game } = table();
    const zabaz = enter(game, "Zabaz, the Glimmerwasp");
    expect(counters(game, zabaz)).toBe(1);
    const worker = enter(game, "Arcbound Worker");
    expect(counters(game, worker)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(worker)]);
    expect(counters(game, worker)).toBe(3);
  });

  it("doesn't boost its own modular, since it has left the battlefield (its ruling)", () => {
    const { game, a } = table();
    const zabaz = enter(game, "Zabaz, the Glimmerwasp");
    const ravager = enter(game, "Arcbound Ravager");
    pickTargets(a, ravager);
    pickModes(a, 0);
    destroy(game, zabaz);
    expect(counters(game, ravager)).toBe(2);
  });

  it("reaches an opponent's modular ability putting counters on your creature, not on theirs", () => {
    const { game, b } = table();
    enter(game, "Zabaz, the Glimmerwasp");
    const mine = enter(game, "Arcbound Ravager");
    const theirs = enter(game, "Arcbound Ravager", B);
    const workerOne = enter(game, "Arcbound Worker", B);
    const workerTwo = enter(game, "Arcbound Worker", B);
    pickModes(b, 0);
    pickTargets(b, mine);
    destroy(game, workerOne, A);
    expect(counters(game, mine)).toBe(3);
    pickTargets(b, theirs);
    destroy(game, workerTwo, A);
    expect(counters(game, theirs)).toBe(2);
  });
});

describe("modular is stamped on both its halves", () => {
  it("every pool card with a modular line has its dies trigger and enters-with static marked `keywordOf: \"modular\"`", () => {
    const modular = POOL_CARDS.filter((def) => def.text.split("\n").some((line) => /^Modular( \d+|—Sunburst)/.test(line)));
    expect(modular.length).toBeGreaterThan(20);
    for (const def of modular) {
      expect(def.triggered.filter((t) => t.keywordOf === "modular").length, def.name).toBe(1);
      expect(def.static.filter((s) => s.keywordOf === "modular").length, def.name).toBe(1);
    }
  });
});
