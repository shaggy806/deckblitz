/**
 * Counters of several kinds put on one permanent by one instruction are one
 * event for that permanent (rule 603.2c): a "whenever one or more counters are
 * put on" trigger fires once for them, and "the same number and kind" reads
 * every kind that went on.
 */
import { describe, expect, it } from "vitest";
import { cast, counters, lands, pickTargets, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

/** Captain Marvel beside a creature: how many times she asks her "may". */
function beside() {
  const t = table();
  const marvel = spawn(t.game, "Captain Marvel, Apex Avenger");
  const bears = spawn(t.game, "Grizzly Bears");
  let asked = 0;
  t.a.chooseModesFn = () => {
    asked += 1;
    return [0];
  };
  return { ...t, marvel, bears, asks: () => asked };
}

describe("counters of several kinds at once", () => {
  it("one spell's +1/+1 and lifelink counters trigger once, and both are copied", () => {
    const { game, marvel, bears, asks } = beside();
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Unexpected Fangs"), { targets: [ref(bears)] });
    expect(asks()).toBe(1);
    expect(counters(game, marvel)).toBe(1);
    expect(counters(game, marvel, "lifelink")).toBe(1);
  });

  it("two separate placements of one kind still trigger twice", () => {
    const { game, marvel, bears, asks } = beside();
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Unexpected Fangs"), { targets: [ref(bears)] });
    expect(asks()).toBe(1);
    cast(game, toHand(game, "Unexpected Fangs"), { targets: [ref(bears)] });
    expect(asks()).toBe(2);
    expect(counters(game, marvel)).toBe(2);
    expect(counters(game, marvel, "lifelink")).toBe(2);
  });

  it("The Ozolith moving two kinds is one placement, the numbers kept per kind", () => {
    const { game, a, marvel, asks } = (() => {
      const t = table({ step: "upkeep" });
      const m = spawn(t.game, "Captain Marvel, Apex Avenger");
      let asked = 0;
      t.a.chooseModesFn = () => {
        asked += 1;
        return [0];
      };
      return { ...t, marvel: m, asks: () => asked };
    })();
    const ozolith = spawn(game, "The Ozolith");
    game.state.objects[ozolith].counters = { "+1/+1": 3, flying: 1 };
    const target = spawn(game, "Grizzly Bears");
    pickTargets(a, target);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, target)).toBe(3);
    expect(counters(game, target, "flying")).toBe(1);
    // One for The Ozolith's own "you may move", one for Captain Marvel.
    expect(asks()).toBe(2);
    expect(counters(game, marvel)).toBe(3);
    expect(counters(game, marvel, "flying")).toBe(1);
  });
});
