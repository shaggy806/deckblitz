/**
 * "If it shares a card type with the card exiled this way": an effect gated on
 * its target sharing a card type (rule 205.2a) with the card its cost exiled
 * (`object-matches` over the target, `sharesCardTypeWith: { paid: "exiled" }`)
 * — Holistic Wisdom's "{2}, Exile a card from your hand: Return target card
 * from your graveyard to your hand if it shares a card type with the card
 * exiled this way."
 */
import { describe, expect, it } from "vitest";
import { activate, lands, pickFromZone, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

function setUp(exiledName: string, targetName: string) {
  const { game, a } = table();
  const wisdom = spawn(game, "Holistic Wisdom");
  lands(game, "Forest", 2);
  const exiled = toHand(game, exiledName);
  const target = toGraveyard(game, targetName);
  pickFromZone(a, exiled);
  activate(game, wisdom, 0, { targets: [{ kind: "object", object: target }] });
  return { game, exiled, target };
}

describe("Holistic Wisdom", () => {
  it("returns the target when it shares a card type with the exiled card", () => {
    const { game, exiled, target } = setUp("Hill Giant", "Gray Ogre");
    expect(zone(game, exiled)).toBe("exile");
    expect(zone(game, target)).toBe("hand");
  });

  it("leaves the target in the graveyard when they share no card type", () => {
    const { game, exiled, target } = setUp("Lightning Bolt", "Gray Ogre");
    expect(zone(game, exiled)).toBe("exile");
    expect(zone(game, target)).toBe("graveyard");
  });

  it("counts one card type in common among several (an artifact creature and an artifact)", () => {
    const { game, target } = setUp("Ornithopter", "Sol Ring");
    expect(zone(game, target)).toBe("hand");
  });
});
