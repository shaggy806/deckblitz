/**
 * Batch 261, the lead's cards: the cards freed by the need-keys families
 * that needed an engine fix first.
 */
import { describe, expect, it } from "vitest";
import { A, B, destroy, enter, life, pickPermanents, pickTargets, table, toStep, zone } from "./harness.js";

describe("Vengeful Strangler // Strangling Grasp", () => {
  it("returns transformed as an Aura attached to the target (rule 712.14), judged as its back face", () => {
    const { game, a } = table();
    const strangler = enter(game, "Vengeful Strangler");
    const bears = enter(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    destroy(game, strangler);
    const grasp = game.state.objects[strangler];
    expect(grasp.zone).toBe("battlefield");
    expect(grasp.face).toBe(1);
    expect(grasp.attachedTo).toBe(bears);
    expect(grasp.controller).toBe(A);
  });

  it("at your upkeep the enchanted permanent's controller sacrifices, then that player loses 1 life", () => {
    const { game, a, b } = table();
    const strangler = enter(game, "Vengeful Strangler");
    const bears = enter(game, "Grizzly Bears", B);
    const memnite = enter(game, "Memnite", B);
    pickTargets(a, bears);
    destroy(game, strangler);
    expect(game.state.objects[strangler].attachedTo).toBe(bears);
    // Bob sacrifices the enchanted Bears itself: he still loses the life.
    pickPermanents(b, bears);
    const before = life(game, B);
    toStep(game, "draw", A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, memnite)).toBe("battlefield");
    expect(life(game, B)).toBe(before - 1);
  });
});
