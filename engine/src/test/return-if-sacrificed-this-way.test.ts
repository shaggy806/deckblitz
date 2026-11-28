/**
 * "Sacrifice that creature. If you do, return this card to the battlefield"
 * (Shifty Doppelganger): a delayed ability about what its resolution put onto
 * the battlefield, remembering the card its exile cost made (rule 400.7j,
 * `{ paid: "exiled" }`), returned only if the sacrifice happened.
 */
import { describe, expect, it } from "vitest";

import { A, activate, destroy, lands, pickFromZone, settle, spawn, table, toHand, toStep, zone } from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

function board(): { game: ReturnType<typeof table>["game"]; a: ReturnType<typeof table>["a"]; doppel: string; bears: string } {
  const { game, a } = table();
  const doppel = spawn(game, "Shifty Doppelganger");
  lands(game, "Island", 4);
  const bears = toHand(game, "Grizzly Bears");
  return { game, a, doppel, bears };
}

describe("Shifty Doppelganger", () => {
  it("puts a creature in with haste, then trades it back for this card at the end step", () => {
    const { game, a, doppel, bears } = board();
    pickFromZone(a, bears);
    activate(game, doppel, 0);
    expect(zone(game, doppel)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(computeCharacteristics(game.state, game.registry, bears).keywords).toContain("haste");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, doppel)).toBe("battlefield");
    expect(game.state.objects[doppel].controller).toBe(A);
  });

  it("stays in exile when the creature is gone by the end step", () => {
    const { game, a, doppel, bears } = board();
    pickFromZone(a, bears);
    activate(game, doppel, 0);
    destroy(game, bears);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, doppel)).toBe("exile");
  });

  it("declined, nothing is put in and this card stays in exile", () => {
    const { game, a, doppel, bears } = board();
    pickFromZone(a);
    activate(game, doppel, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, doppel)).toBe("exile");
  });
});
