import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, life, nextTurn, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

// "If that creature would die this turn, exile it instead" (Lava Coil — rule
// 614.1a): a replacement that follows the target for the rest of the turn,
// whatever kills it. Surge [cost] (rule 702.117a): "You may cast this spell
// for its surge cost if you or a teammate has cast another spell this turn"
// — an alternative cost whose spell answers "if its surge cost was paid".

describe("exile if it would die this turn", () => {
  it("Lava Coil: the creature it kills is exiled, not put into a graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lava Coil"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("applies to a creature that survives the damage, for whatever kills it later that turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Lava Coil"), { targets: [ref(maw)] });
    expect(zone(game, maw)).toBe("battlefield");
    destroy(game, maw);
    expect(zone(game, maw)).toBe("exile");
  });

  it("ends with the turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Lava Coil"), { targets: [ref(maw)] });
    nextTurn(game);
    destroy(game, maw);
    expect(zone(game, maw)).toBe("graveyard");
  });

  it("Bleed Dry: a creature put into the graveyard by state-based actions is exiled too", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Bleed Dry"), { targets: [ref(maw)] });
    expect(zone(game, maw)).toBe("exile");
  });

  it("Scorching Dragonfire: a planeswalker it kills is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    cast(game, toHand(game, "Scorching Dragonfire"), { targets: [ref(jace)] });
    expect(zone(game, jace)).toBe("exile");
  });

  it("is about that permanent only: another creature dying that turn goes to the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lava Coil"), { targets: [ref(maw)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("exile if a permanent dealt damage this way would die this turn", () => {
  it("Anger of the Gods: each creature it damaged, killed by it or later that turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Anger of the Gods"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, maw)).toBe("battlefield");
    destroy(game, maw);
    expect(zone(game, maw)).toBe("exile");
  });

  it("a creature that wasn't dealt damage isn't covered: one entering later that turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Anger of the Gods"));
    const later = spawn(game, "Grizzly Bears", B);
    destroy(game, later);
    expect(zone(game, later)).toBe("graveyard");
  });

  it("Incendiary Flow: 'a creature dealt damage this way' leaves a planeswalker out", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    cast(game, toHand(game, "Incendiary Flow"), { targets: [ref(jace)] });
    expect(zone(game, jace)).toBe("graveyard");
  });

  it("Underworld Fires: 'a permanent dealt damage this way' covers a planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 1;
    cast(game, toHand(game, "Underworld Fires"));
    expect(zone(game, jace)).toBe("exile");
  });

  it("Torch the Tower bargained: 3 damage, a scry, and the exile", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const treasure = spawn(game, "Treasure Token");
    const maw = spawn(game, "Colossal Dreadmaw", B);
    game.state.objects[maw].damageMarked = 3;
    cast(game, toHand(game, "Torch the Tower"), { targets: [ref(maw)], kicked: true });
    expect(zone(game, treasure)).not.toBe("battlefield");
    expect(zone(game, maw)).toBe("exile");
  });
});

const surgeOffers =(game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("surge", () => {
  it("is offered only once its caster has cast another spell this turn, labelled with its cost", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const salvo = toHand(game, "Boulder Salvo");
    const bears = spawn(game, "Grizzly Bears", B);
    // The spell being cast isn't "another spell" (rule 601.2b reads the
    // condition as the cost is chosen).
    expect(surgeOffers(game, salvo)).toHaveLength(0);
    expect(() => cast(game, salvo, { targets: [ref(bears)], altCost: true })).toThrow(/refused/);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const offer = surgeOffers(game, salvo);
    expect(offer).toHaveLength(1);
    expect(offer[0]).toMatchObject({ altCostText: "surge {1}{R}" });
    cast(game, salvo, { targets: [ref(bears)], altCost: true });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Tyrant of Valakut: the enters trigger needs its surge cost to have been paid", () => {
    const { game, a } = table();
    pickTargets(a, B);
    lands(game, "Mountain", 7);
    const first = toHand(game, "Tyrant of Valakut");
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    // A second Tyrant for its surge cost, the first being another spell.
    const second = toHand(game, "Tyrant of Valakut");
    lands(game, "Mountain", 5);
    cast(game, second, { altCost: true });
    expect(zone(game, second)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });
});
