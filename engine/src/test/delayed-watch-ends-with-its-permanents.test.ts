/**
 * A delayed "whenever" that outlasts its turn (`until: "permanent"` or
 * `"while-exiled"`) and watches permanents (`watching`) ends once every one
 * of them has left the battlefield (rule 400.7: a card back on the
 * battlefield is a new object it never sees), or once the cards it's about
 * have all left exile — checked as the next turn begins, so their leaving and
 * what that set off could still fire it. Phasing out isn't leaving (702.26d).
 * Myra the Magnificent's "for as long as that Attraction is on the
 * battlefield, whenever you visit it".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, destroy, lands, lightUp, pickPermanents, ref, settle, spawn, table, toGraveyard, toStep } from "./harness.js";

/** The delayed "whenever" watches on permanents. */
const watches = (game: Game): number =>
  game.state.delayedTriggers.filter((t) => "whenever" in t.at && t.at.watching !== undefined).length;

/** Alice's Myra exiles a Shock from her graveyard, choosing an Information Booth that's never visited. */
function myraWatch(): { game: Game; booth: ObjectId; shock: ObjectId } {
  const { game, a } = table();
  const myra = spawn(game, "Myra the Magnificent");
  const booth = spawn(game, "Information Booth");
  lightUp(game, booth, []);
  const shock = toGraveyard(game, "Shock");
  lands(game, "Island", 1);
  pickPermanents(a, booth);
  activate(game, myra, 0, { x: 1, targets: [ref(shock)] });
  expect(watches(game)).toBe(1);
  return { game, booth, shock };
}

describe("a longer watch ends with what it watches", () => {
  it("lasts while its Attraction stays, turn after turn", () => {
    const { game } = myraWatch();
    toStep(game, "precombat-main", A);
    toStep(game, "precombat-main", A);
    expect(watches(game)).toBe(1);
  });

  it("ends as the next turn begins once its Attraction has left the battlefield", () => {
    const { game, booth } = myraWatch();
    destroy(game, booth);
    // Still there for the rest of this turn.
    expect(watches(game)).toBe(1);
    toStep(game, "upkeep", B);
    expect(watches(game)).toBe(0);
  });

  it("ends once the exiled card has left exile", () => {
    const { game, shock } = myraWatch();
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "exile" }, [ref(shock)]);
    settle(game);
    toStep(game, "upkeep", B);
    expect(watches(game)).toBe(0);
  });

  it("goes on while its Attraction is phased out", () => {
    const { game, booth } = myraWatch();
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(booth)]);
    settle(game);
    expect(game.state.objects[booth].zone).toBe("phased-out");
    toStep(game, "upkeep", B);
    expect(watches(game)).toBe(1);
  });
});
