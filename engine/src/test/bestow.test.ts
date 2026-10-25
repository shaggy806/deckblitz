/**
 * Bestow (rule 702.103): cast for its bestow cost, a creature card is an Aura
 * spell with enchant creature — no creature on the stack or the battlefield —
 * and the Aura it becomes is a creature again, where it is, once it's
 * unattached (702.103f). With its target illegal as it begins resolving, it
 * resolves as the creature (702.103e). Journey into Nyx (batch 161).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  destroy,
  graveyard,
  lands,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("casting bestowed", () => {
  it("is an Aura spell, not a creature spell, and enters attached to its target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const scarhide = toHand(game, "Gnarled Scarhide");
    cast(game, scarhide, { overload: true, targets: [ref(bears)], settle: false });
    expect(zone(game, scarhide)).toBe("stack");
    expect(types(game, scarhide)).toEqual(["enchantment"]);
    expect(subtypes(game, scarhide)).toEqual(["Aura"]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, scarhide)).toBe("battlefield");
    expect(game.state.objects[scarhide].attachedTo).toBe(bears);
    expect(types(game, scarhide)).toEqual(["enchantment"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });

  it("creature-only mana can't pay its bestow cost, but pays its mana cost (702.103b)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Ancient Ziggurat", 4);
    const scarhide = toHand(game, "Gnarled Scarhide");
    const bestowed = { type: "cast-spell", player: A, card: scarhide, targets: [ref(bears)], overload: true } as const;
    expect(game.canDispatch(bestowed)).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: A, card: scarhide, targets: [] })).toBeNull();
  });

  it("cast for its mana cost, it's the creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const scarhide = toHand(game, "Gnarled Scarhide");
    cast(game, scarhide);
    expect(zone(game, scarhide)).toBe("battlefield");
    expect(types(game, scarhide)).toEqual(["enchantment", "creature"]);
    expect(game.state.objects[scarhide].attachedTo).toBeNull();
    expect(pt(game, scarhide)).toEqual({ power: 2, toughness: 1 });
  });

  it("with the enchanted creature gone, it stays on the battlefield as a creature (702.103f)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    lands(game, "Swamp", 3);
    const warhound = toHand(game, "Mogis's Warhound");
    cast(game, warhound, { overload: true, targets: [ref(bears)] });
    expect(game.state.objects[warhound].attachedTo).toBe(bears);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, warhound)).toBe("battlefield");
    expect(graveyard(game)).not.toContain(warhound);
    expect(game.state.objects[warhound].attachedTo).toBeNull();
    expect(types(game, warhound)).toEqual(["enchantment", "creature"]);
    expect(subtypes(game, warhound)).toEqual(["Dog"]);
    expect(pt(game, warhound)).toEqual({ power: 2, toughness: 2 });
  });

  it("with its target gone as it resolves, it resolves as the creature (702.103e)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const scarhide = toHand(game, "Gnarled Scarhide");
    cast(game, scarhide, { overload: true, targets: [ref(bears)], settle: false });
    destroy(game, bears);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, scarhide)).toBe("battlefield");
    expect(game.state.objects[scarhide].attachedTo).toBeNull();
    expect(types(game, scarhide)).toEqual(["enchantment", "creature"]);
  });

  it("bestowed on an opponent's creature, Hypnotic Siren takes it, and leaves it there once a creature", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 7);
    const siren = toHand(game, "Hypnotic Siren");
    cast(game, siren, { overload: true, targets: [ref(theirs)] });
    expect(controller(game, theirs)).toBe("alice");
    expect(controller(game, siren)).toBe("alice");
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });

  it("a creature that bestowed Crystalline Nautilus enchants is sacrificed when targeted", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    lands(game, "Mountain", 1);
    const nautilus = toHand(game, "Crystalline Nautilus");
    cast(game, nautilus, { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    // Its Aura is a 4/4 creature again.
    expect(zone(game, nautilus)).toBe("battlefield");
    expect(pt(game, nautilus)).toEqual({ power: 4, toughness: 4 });
  });
});
