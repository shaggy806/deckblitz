/**
 * A triggered ability's target slot filtered by the spell that triggered it
 * (`sameNameWith: "trigger-object"`): chosen as the trigger goes on the stack
 * (rule 603.3d), checked again as it resolves (608.2b) — Harness the Storm.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, lands, life, ref, spawn, table, toGraveyard, toHand, watchTargets, zone } from "./harness.js";

describe("Harness the Storm", () => {
  it("targets only a card of that spell's name in your graveyard, and casts it, paying its cost", () => {
    const { game, a } = table();
    spawn(game, "Harness the Storm");
    const mountains = lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    const otherBolt = toGraveyard(game, "Lightning Bolt");
    const oldBolt = toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Shock");
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot.find((id) => id === oldBolt) ?? null));
    let asked = 0;
    a.chooseCastNowFn = (_v, offer) => {
      asked += 1;
      expect(offer.cards).toEqual([oldBolt]);
      return { type: "cast-spell", player: A, card: oldBolt, targets: [ref(B)], via: "effect" };
    };
    cast(game, bolt, { targets: [ref(B)] });
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([otherBolt, oldBolt].sort());
    expect(asked).toBe(1);
    expect(zone(game, otherBolt)).toBe("graveyard");
    expect(zone(game, oldBolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 6);
    expect(mountains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("can still cast the target after the triggering spell has left the stack", () => {
    const { game, a } = table();
    spawn(game, "Harness the Storm");
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    const oldBolt = toGraveyard(game, "Lightning Bolt");
    watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: oldBolt, targets: [ref(B)], via: "effect" });
    cast(game, bolt, { targets: [ref(B)], settle: false });
    // The trigger is on the stack above the Bolt: take the Bolt off the stack
    // (as a counterspell would) before the trigger resolves.
    game.debugMove(bolt, "graveyard");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game, B)).toBe(20 - 3);
  });

  it("isn't offered a card of another name, or a spell cast from elsewhere", () => {
    const { game, a } = table();
    spawn(game, "Harness the Storm");
    lands(game, "Mountain", 2);
    toGraveyard(game, "Shock");
    const seen = watchTargets(a);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(20 - 3);
  });
});
