/**
 * `discard-chosen`'s `alsoFrom: { zone: "target", slot }`: one choice over a
 * revealed hand's cards and a targeted permanent — Cloak and Dagger,
 * Entwined's "you may exile a nonland card from their hand or the chosen
 * creature until Cloak and Dagger leave the battlefield" (rule 610.3: back
 * to the zone each came from).
 */
import { describe, expect, it } from "vitest";

import { B, enter, hand, pickFromZone, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

const CLOAK = "Cloak and Dagger, Entwined";

describe("Cloak and Dagger, Entwined", () => {
  it("offers the hand's nonland cards and the chosen creature in one choice; a hand card comes back to the hand", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    toHand(game, "Mountain", B);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, bear);
    const seen = pickFromZone(a, bolt);
    const cloak = enter(game, CLOAK);
    expect([...seen.offered].sort()).toEqual([bolt, bear].sort());
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bear)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(cloak)]);
    expect(hand(game, B)).toContain(bolt);
  });

  it("the creature exiled comes back to the battlefield under its owner's control", () => {
    const { game, a } = table();
    toHand(game, "Lightning Bolt", B);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, bear);
    pickFromZone(a, bear);
    const cloak = enter(game, CLOAK);
    expect(zone(game, bear)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(cloak)]);
    const back = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].controller).toBe(B);
  });

  it("is a may: nothing exiled when declined, and only the hand with no creature chosen", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, null);
    const seen = pickFromZone(a);
    enter(game, CLOAK);
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("the creature is offered even with nothing in hand", () => {
    const { game, a } = table();
    for (const id of [...hand(game, B)]) game.debugMove(id, "graveyard");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B, bear);
    const seen = pickFromZone(a, bear);
    enter(game, CLOAK);
    expect(seen.offered).toEqual([bear]);
    expect(zone(game, bear)).toBe("exile");
  });
});
