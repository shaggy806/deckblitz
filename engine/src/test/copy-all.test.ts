/**
 * "Copy all spells you control, then copy all other activated and triggered
 * abilities you control. You may choose new targets for the copies" (rule
 * 707.10 — Ulalek, Fused Atrocity's `copy-all`): what's on the stack as it
 * resolves, each once, the trigger itself left out; with two or more to copy
 * the controller chooses which goes next.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, named, pickTargets, ref, settle, spawn, table, toHand } from "./harness.js";

function board() {
  const t = table();
  spawn(t.game, "Ulalek, Fused Atrocity");
  lands(t.game, "Wastes", 10);
  lands(t.game, "Mountain", 2);
  lands(t.game, "Island", 2);
  return t;
}

describe("copy-all (Ulalek, Fused Atrocity)", () => {
  it("paying {C}{C}: the Eldrazi spell and another spell of yours are each copied once", () => {
    const { game, a } = board();
    const bolt = toHand(game, "Lightning Bolt");
    const infiltrator = toHand(game, "Dimensional Infiltrator");
    pickTargets(a, B);
    const offered: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, modes) => {
      offered.push([...modes]);
      return [0];
    };
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, infiltrator, { settle: false });
    settle(game);
    // The bolt and its copy.
    expect(life(game, B)).toBe(14);
    // The Infiltrator and the token its copy became.
    expect(named(game, "Dimensional Infiltrator")).toHaveLength(2);
    // Asked to pay, then which of the two spells is copied first.
    expect(offered.some((texts) => texts.some((t) => t.startsWith("Copy Lightning Bolt")))).toBe(true);
  });

  it("declining the {C}{C}, nothing is copied", () => {
    const { game, a } = board();
    const bolt = toHand(game, "Lightning Bolt");
    const infiltrator = toHand(game, "Dimensional Infiltrator");
    a.chooseModesFn = () => [];
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, infiltrator, { settle: false });
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(named(game, "Dimensional Infiltrator")).toHaveLength(1);
  });

  it("copies another activated ability of yours, but not its own trigger", () => {
    const { game, a } = board();
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    const infiltrator = toHand(game, "Dimensional Infiltrator");
    pickTargets(a, B);
    a.chooseModesFn = () => [0];
    activate(game, pyromancer, 0, { targets: [ref(B)], settle: false });
    cast(game, infiltrator, { settle: false });
    settle(game);
    // The ping and its copy; Ulalek's trigger made one copy of each.
    expect(life(game, B)).toBe(18);
    expect(named(game, "Dimensional Infiltrator")).toHaveLength(2);
    expect(life(game, A)).toBe(20);
  });

  it("a non-Eldrazi spell doesn't trigger it", () => {
    const { game, a } = board();
    const bolt = toHand(game, "Lightning Bolt");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, bolt, { targets: [ref(B)] });
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(17);
  });
});
