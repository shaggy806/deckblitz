/**
 * Cards returned to the battlefield together (a `for-each-target` with
 * `simultaneous`: Back in Town, Brought Back) enter at the same time, so a
 * Clone among them can copy only what was already there (rule 614.12: its
 * choice is made before it enters, and the others aren't on the battlefield
 * yet) — whichever of the targets comes first.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { ObjectId } from "../primitives.js";
import { A, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const RETURN_TOGETHER: EffectSpec = {
  kind: "for-each-target",
  from: 0,
  simultaneous: true,
  effect: { kind: "put-onto-battlefield", target: 0 },
};

describe("a Clone returned beside another creature", () => {
  for (const cloneFirst of [true, false]) {
    it(`can't copy it (the Clone ${cloneFirst ? "first" : "second"} among the targets)`, () => {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears");
      const clone = toGraveyard(game, "Clone");
      const giant = toGraveyard(game, "Hill Giant");
      let options: readonly ObjectId[] = [];
      a.chooseCopyFn = (_view, _source, offered) => {
        options = offered;
        return offered[0] ?? null;
      };
      game.debugApplyEffect(A, RETURN_TOGETHER, cloneFirst ? [ref(clone), ref(giant)] : [ref(giant), ref(clone)]);
      settle(game);
      expect(zone(game, clone)).toBe("battlefield");
      expect(zone(game, giant)).toBe("battlefield");
      expect(options).toContain(bears);
      expect(options).not.toContain(giant);
    });
  }
});
