/**
 * "Whenever you cast an instant or sorcery spell with a single target, you
 * may copy it. If you do, those spells gain wither. You may choose new
 * targets for the copy." — Spinerock Tyrant: a spell filter's `targets.count`
 * ("with a single target", rule 115.9a), and `copy-spell`'s
 * `gains.alsoOriginal`, the spell copied gaining wither beside its copy.
 * Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, life, pickModes, pickTargets, ref, spawn, table, toHand, zone, lands } from "./harness.js";

describe("Spinerock Tyrant", () => {
  it("a copied Lightning Bolt and the Bolt itself both deal their damage as -1/-1 counters", () => {
    const { game, a } = table();
    spawn(game, "Spinerock Tyrant");
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Hill Giant", B);
    const bolt = toHand(game, "Lightning Bolt");
    pickModes(a, 0);
    // The copy's new target.
    pickTargets(a, giant);
    cast(game, bolt, { targets: [ref(wurm)] });
    expect(counters(game, wurm, "-1/-1")).toBe(3);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("declined, nothing is copied and the Bolt deals plain damage", () => {
    const { game, a } = table();
    spawn(game, "Spinerock Tyrant");
    lands(game, "Mountain", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    const bolt = toHand(game, "Lightning Bolt");
    pickModes(a);
    cast(game, bolt, { targets: [ref(wurm)] });
    expect(counters(game, wurm, "-1/-1")).toBe(0);
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("a spell with two targets doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Spinerock Tyrant");
    lands(game, "Mountain", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const arc = toHand(game, "Arc Trail");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    cast(game, arc, { targets: [ref(wurm), ref(B)] });
    expect(asked).toBe(false);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    expect(life(game, B)).toBe(19);
  });

  it("a spell aimed at a player is copied too, the copy at another player", () => {
    const { game, a } = table();
    spawn(game, "Spinerock Tyrant");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    pickModes(a, 0);
    pickTargets(a, A);
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(17);
  });
});
