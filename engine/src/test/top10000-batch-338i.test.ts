/**
 * B338 (author-top-cards overnight), triggers-journal lane: Sacred Ground
 * (`leaves-battlefield.byEffectOf: "opponent"`; an edict's sacrifice,
 * chosen by the player, is still its spell's doing).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Sacred Ground", () => {
  it("returns a land of yours an opponent's spell destroys", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const [plains] = lands(game, "Plains", 1);
    destroy(game, plains, B);
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].controller).toBe(A);
  });

  it("leaves a land your own spell destroys, and an opponent's land, in the graveyard", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const [plains] = lands(game, "Plains", 1);
    const [swamp] = lands(game, "Swamp", 1, B);
    destroy(game, plains, A);
    destroy(game, swamp, A);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("graveyard");
  });

  it("returns a land sacrificed to an opponent's edict", () => {
    const { game, a } = table();
    spawn(game, "Sacred Ground");
    const [plains, forest] = [...lands(game, "Plains", 1), ...lands(game, "Forest", 1)];
    lands(game, "Mountain", 5, B);
    toStep(game, "precombat-main", B);
    const epicenter = toHand(game, "Epicenter", B);
    a.chooseSacrificesFn = () => [forest];
    const moves = game.state.objects[forest].zoneChangeCount ?? 0;
    cast(game, epicenter, { player: B, targets: [ref(A)] });
    settle(game);
    // Sacrificed, then back.
    expect(game.state.objects[forest].zoneChangeCount ?? 0).toBeGreaterThanOrEqual(moves + 2);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, plains)).toBe("battlefield");
  });

  it("doesn't see lethal damage's state-based action", () => {
    const { game } = table();
    spawn(game, "Sacred Ground");
    const arbor = spawn(game, "Dryad Arbor");
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 1 }, [ref(arbor)]);
    toStep(game, "begin-combat");
    expect(zone(game, arbor)).toBe("graveyard");
  });
});
