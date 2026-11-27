/**
 * "When enchanted creature dies, return this card to the battlefield
 * transformed" (Skin Invasion, Radiant Grace, Journey to Eternity): "return"
 * is from the graveyard the Aura went to after its creature died (704.5m). An
 * Aura put somewhere else instead — exiled by Leyline of the Void — is a new
 * object there (rule 400.7) the ability can't find, so it stays in exile.
 * (Before `put-onto-battlefield`'s `fromGraveyard`, "source" followed the card
 * into exile and brought it back from there.)
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("an Aura's dies trigger returns it from the graveyard only", () => {
  it("Skin Invasion stays exiled when Leyline of the Void exiled it [Skin Invasion]", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const aura = toHand(game, "Skin Invasion");
    cast(game, aura, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, aura)).toBe("exile");
  });

  it("Skin Invasion still returns transformed from the graveyard [Skin Invasion]", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const aura = toHand(game, "Skin Invasion");
    cast(game, aura, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[aura].controller).toBe(A);
  });

  it("Radiant Grace stays exiled when Leyline of the Void exiled it [Radiant Grace]", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const aura = toHand(game, "Radiant Grace");
    cast(game, aura, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, aura)).toBe("exile");
  });

  it("Journey to Eternity returns the creature but stays exiled itself [Journey to Eternity]", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", B);
    // Bob's creature under Alice's control: it goes to Bob's graveyard, which
    // Leyline of the Void doesn't touch, so it dies; Journey goes to Alice's,
    // which it does.
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const journey = toHand(game, "Journey to Eternity");
    cast(game, journey, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(zone(game, journey)).toBe("exile");
  });

  it("Journey to Eternity returns both from the graveyard [Journey to Eternity]", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const journey = toHand(game, "Journey to Eternity");
    cast(game, journey, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, journey)).toBe("battlefield");
  });
});
