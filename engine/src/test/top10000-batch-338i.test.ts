/**
 * B338 (author-top-cards overnight), triggers-journal lane: Sacred Ground
 * (`leaves-battlefield.byEffectOf: "opponent"`; an edict's sacrifice,
 * chosen by the player, is still its spell's doing); Hibernation's End
 * (the `cumulative-upkeep-paid` event, announced by every way of paying).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  lands,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

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

describe("Hibernation's End", () => {
  it("paid, searches for a creature card with mana value exactly the age counters", () => {
    const { game, a } = table({ deck: "Island" });
    const end = spawn(game, "Hibernation's End");
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, elves);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, end, "age")).toBe(1);
    expect(zone(game, end)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(bears);
  });

  it("unpaid, it's sacrificed and searches for nothing", () => {
    const { game, a } = table({ deck: "Island" });
    const end = spawn(game, "Hibernation's End");
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, end)).toBe("graveyard");
    expect(zone(game, elves)).toBe("library");
    expect(game.state.eventLog.some((e) => e.type === "cumulative-upkeep-paid")).toBe(false);
  });

  it("a cumulative upkeep paid by an act announces the payment too", () => {
    const { game, a } = table({ deck: "Island" });
    const lash = spawn(game, "Thought Lash");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, lash)).toBe("battlefield");
    expect(
      game.state.eventLog.some((e) => e.type === "cumulative-upkeep-paid" && e.object === lash && e.player === A),
    ).toBe(true);
  });
});
