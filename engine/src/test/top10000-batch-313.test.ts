/**
 * Batch 313's cards on vocabulary already there: Strong Back (equip and Aura
 * cost reductions keyed to the enchanted creature).
 */
import { describe, expect, it } from "vitest";

import { activate, cast, lands, pt, ref, spawn, table, toHand } from "./harness.js";

const strongBackOn = (game: Parameters<typeof spawn>[0], creature: string) => {
  const bears = spawn(game, creature);
  lands(game, "Forest", 3);
  cast(game, toHand(game, "Strong Back"), { targets: [ref(bears)] });
  return bears;
};

describe("Strong Back", () => {
  it("equip targeting the enchanted creature costs {3} less; another creature pays full", () => {
    const { game } = table();
    const bears = strongBackOn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Loxodon Warhammer");
    expect(() => activate(game, hammer, 0, { targets: [ref(other)] })).toThrow();
    activate(game, hammer, 0, { targets: [ref(bears)] });
    expect(game.state.objects[hammer].attachedTo).toBe(bears);
    // +2/+2 for Strong Back and +2/+2 for the Warhammer, +3/+0 from it.
    expect(pt(game, bears)).toEqual({ power: 9, toughness: 6 });
  });

  it("an Aura spell targeting it costs {3} less (only the generic part)", () => {
    const { game } = table();
    const bears = strongBackOn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const mask = toHand(game, "Ancestral Mask");
    expect(() => cast(game, mask, { targets: [ref(other)] })).toThrow();
    cast(game, mask, { targets: [ref(bears)] });
    expect(game.state.objects[mask].attachedTo).toBe(bears);
  });
});
