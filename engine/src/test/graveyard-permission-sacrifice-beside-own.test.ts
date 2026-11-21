/**
 * A cast permission's sacrifice beside the spell's own (Maestros Ascendancy:
 * "by sacrificing a creature in addition to paying its other costs", rule
 * 601.2f). Under it, Fling pays both: its own creature, named on the cast and
 * what "the sacrificed creature" reads, and the permission's, chosen as it's
 * paid (`Game.namesOwnSacrifice`, `SacrificeCostPart.besideOwn`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, enter, lands, life, spawn, table, toGraveyard, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const graveyardCast = (game: Game, card: ObjectId): CastOffer | undefined =>
  game
    .legalActions(A)
    .find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");

describe("Maestros Ascendancy", () => {
  it("casts an instant from the graveyard for a creature, exiles it after, once a turn", () => {
    const { game } = table();
    enter(game, "Maestros Ascendancy");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    expect(graveyardCast(game, bolt)).toBeDefined();
    cast(game, bolt, { via: "graveyard-permission", targets: [{ kind: "player", player: B }] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
    spawn(game, "Llanowar Elves");
    expect(graveyardCast(game, shock)).toBeUndefined();
  });

  it("casts an Adventure card's instant half, which goes on its adventure; never the creature", () => {
    const { game } = table();
    enter(game, "Maestros Ascendancy");
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Bonecrusher Giant");
    const offers = game
      .legalActions(A)
      .filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === giant && a.via === "graveyard-permission");
    expect(offers.map((o) => o.face)).toEqual([1]);
    cast(game, giant, { face: 1, via: "graveyard-permission", targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.objects[giant].onAdventure).toBe(true);
  });

  it("Kess, Dissident Mage reaches an Adventure's instant half the same way", () => {
    const { game } = table();
    spawn(game, "Kess, Dissident Mage");
    lands(game, "Mountain", 5);
    const giant = toGraveyard(game, "Bonecrusher Giant");
    const offers = game
      .legalActions(A)
      .filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === giant && a.via === "graveyard-permission");
    expect(offers.map((o) => o.face)).toEqual([1]);
  });

  it("isn't offered with no creature to sacrifice", () => {
    const { game } = table();
    enter(game, "Maestros Ascendancy");
    lands(game, "Mountain", 1);
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(graveyardCast(game, bolt)).toBeUndefined();
  });

  it("casts Fling for two creatures: Fling's own is the one it reads", () => {
    const { game, a } = table();
    enter(game, "Maestros Ascendancy");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const elves = spawn(game, "Llanowar Elves");
    const fling = toGraveyard(game, "Fling");
    expect(graveyardCast(game, fling)).toBeDefined();
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [elves];
    };
    cast(game, fling, { via: "graveyard-permission", sacrifice: giant, targets: [{ kind: "player", player: B }] });
    // The permission's creature is chosen once Fling's own is gone.
    expect([...offered].sort()).toEqual([bears, elves].sort());
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    // Hill Giant's 3 power, not the Elves' 1 or both.
    expect(life(game, B)).toBe(17);
    expect(zone(game, fling)).toBe("exile");
  });

  it("doesn't offer Fling with one creature, which can't pay both", () => {
    const { game } = table();
    enter(game, "Maestros Ascendancy");
    lands(game, "Mountain", 2);
    spawn(game, "Gray Ogre");
    const fling = toGraveyard(game, "Fling");
    expect(graveyardCast(game, fling)).toBeUndefined();
    expect(() => cast(game, fling, { via: "graveyard-permission", targets: [{ kind: "player", player: B }] })).toThrow(/sacrifice/i);
  });
});
