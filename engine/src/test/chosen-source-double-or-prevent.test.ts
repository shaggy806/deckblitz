import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { B, cast, lands, life, pickPermanents, ref, settle, spawn, table, toHand } from "./harness.js";

// "Choose a source you control" (rule 609.7a) as a `choose-permanents` with
// `damageSource`, then a coin flip making a one-shot shield on that source's
// next damage this turn: doubled on a win, prevented on a loss (Desperate
// Gambit). A permanent spell chosen is followed to the permanent it becomes.

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

const flips = (game: Game): boolean[] =>
  game.state.eventLog.flatMap((e) => (e.type === "coin-flipped" && e.won !== undefined ? [e.won] : []));

describe("Desperate Gambit", () => {
  it("doubles the chosen source's next damage on a won flip, prevents it on a lost one; only the next time", () => {
    const seen = new Set<boolean>();
    for (let seed = 1; seed <= 16 && seen.size < 2; seed += 1) {
      const { game, a } = table({ seed });
      lands(game, "Mountain", 1);
      const ogre = spawn(game, "Gray Ogre");
      const offered = pickPermanents(a, ogre);
      cast(game, toHand(game, "Desperate Gambit"));
      // A source you control: not an opponent's.
      expect(offered.offered).toContain(ogre);
      const [won] = flips(game);
      expect(flips(game)).toHaveLength(1);
      hit(game, ogre, ref(B), 2);
      expect(life(game, B)).toBe(won ? 16 : 20);
      hit(game, ogre, ref(B), 2);
      expect(life(game, B)).toBe(won ? 14 : 18);
      seen.add(won);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });

  it("offers only sources you control, your spells on the stack among them", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Gray Ogre");
    const theirs = spawn(game, "Gray Ogre", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const offered = pickPermanents(a, bolt);
    cast(game, toHand(game, "Desperate Gambit"), { settle: false });
    settle(game);
    expect(offered.offered).toContain(mine);
    expect(offered.offered).toContain(bolt);
    expect(offered.offered).not.toContain(theirs);
    const [won] = flips(game);
    expect(life(game, B)).toBe(won ? 14 : 20);
  });

  it("a creature spell chosen: its shield is the permanent's", () => {
    const seen = new Set<boolean>();
    for (let seed = 1; seed <= 16 && seen.size < 2; seed += 1) {
      const { game, a } = table({ seed });
      lands(game, "Mountain", 2);
      lands(game, "Forest", 2);
      const bears = toHand(game, "Grizzly Bears");
      cast(game, bears, { settle: false });
      pickPermanents(a, bears);
      cast(game, toHand(game, "Desperate Gambit"), { settle: false });
      settle(game);
      expect(game.state.objects[bears].zone).toBe("battlefield");
      const [won] = flips(game);
      hit(game, bears, ref(B), 2);
      expect(life(game, B)).toBe(won ? 16 : 20);
      seen.add(won);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
});
