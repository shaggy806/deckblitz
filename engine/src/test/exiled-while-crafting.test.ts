/**
 * "When this creature is exiled from the battlefield while you're activating
 * a craft ability" (Market Gnome): a `leaves-battlefield` trigger's
 * `whileActivatingCraft`, off the leave event's `craftBy` — the player
 * activating a craft ability (rule 602.2) as the permanent left. Its trigger
 * goes on the stack above the craft ability, so it resolves before the
 * crafted card returns (the ruling).
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";

import { A, activate, graveyard, hand, lands, life, pickFromZone, spawn, table, toGraveyard, zone } from "./harness.js";

describe("exiled while activating a craft ability", () => {
  it("Market Gnome crafted away: 1 life and a card, before the crafted card returns", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    const gnome = spawn(game, "Market Gnome");
    const lifeBefore = life(game);
    const handBefore = hand(game).length;
    pickFromZone(a, gnome);
    activate(game, landmark, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length > 1);
    // The Gnome's trigger is above the craft ability, the landmark still in exile.
    expect(zone(game, gnome)).toBe("exile");
    expect(zone(game, landmark)).toBe("exile");
    expect(game.state.zones.shared.stack).toHaveLength(2);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 1);
    expect(life(game)).toBe(lifeBefore + 1);
    expect(zone(game, landmark)).toBe("exile");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(life(game)).toBe(lifeBefore + 1);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(printedCardName(game.state.objects[landmark])).toBe("Oteclan Levitator");
  });

  it("an exile that isn't a craft's doesn't trigger it", () => {
    const { game } = table();
    const gnome = spawn(game, "Market Gnome");
    const lifeBefore = life(game);
    const handBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [{ kind: "object", object: gnome }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, gnome)).toBe("exile");
    expect(life(game)).toBe(lifeBefore);
    expect(hand(game).length).toBe(handBefore);
  });

  it("another material crafted away while the Gnome stays doesn't trigger it", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    const gnome = spawn(game, "Market Gnome");
    const material = toGraveyard(game, "Ornithopter");
    const lifeBefore = life(game);
    pickFromZone(a, material);
    activate(game, landmark, 0);
    expect(zone(game, gnome)).toBe("battlefield");
    expect(life(game)).toBe(lifeBefore);
  });

  it("dying: 1 life and a card", () => {
    const { game } = table();
    const gnome = spawn(game, "Market Gnome");
    const lifeBefore = life(game);
    const handBefore = hand(game).length;
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: gnome }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(graveyard(game)).toContain(gnome);
    expect(life(game)).toBe(lifeBefore + 1);
    expect(hand(game).length).toBe(handBefore + 1);
  });
});
