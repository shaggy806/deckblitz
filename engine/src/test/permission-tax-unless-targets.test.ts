/**
 * "If that spell doesn't target a creature you control, it costs {8} more to
 * cast this way" (Mavinda, Students' Advocate): a permission's `tax` with
 * `unlessTargets`, an increase fixed once the targets are chosen (rules
 * 601.2c, 601.2f) and only on a cast under that permission — read from a
 * graveyard as from exile. An offer the caster can't pay the {8} for gives
 * only the targets that spare it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, hand, lands, pt, ref, spawn, table, toGraveyard, zone } from "./harness.js";

const graveyardCasts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");
const untappedLands = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;

describe("Mavinda, Students' Advocate", () => {
  it("a spell aimed at a creature of yours costs only its own cost, and is exiled after", () => {
    const { game } = table({ seed: 1 });
    const mavinda = spawn(game, "Mavinda, Students' Advocate");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const forests = lands(game, "Forest", 1);
    const growth = toGraveyard(game, "Giant Growth");
    expect(graveyardCasts(game, growth)).toHaveLength(0);
    activate(game, mavinda, 0, { targets: [ref(growth)] });
    // One Forest: the {8} can't be paid, so only Alice's creatures are offered.
    const [offer] = graveyardCasts(game, growth);
    expect(offer).toBeDefined();
    const options = offer.kind === "cast-spell" ? offer.targetOptions[0] : [];
    expect(options).toContainEqual(ref(bears));
    expect(options).not.toContainEqual(ref(theirs));
    expect(() => cast(game, growth, { via: "graveyard-permission", targets: [ref(theirs)] })).toThrow();
    cast(game, growth, { via: "graveyard-permission", targets: [ref(bears)] });
    expect(untappedLands(game, forests)).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, growth)).toBe("exile");
  });

  it("aimed elsewhere, it costs {8} more", () => {
    const { game } = table({ seed: 1 });
    const mavinda = spawn(game, "Mavinda, Students' Advocate");
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const forests = lands(game, "Forest", 10);
    const growth = toGraveyard(game, "Giant Growth");
    activate(game, mavinda, 0, { targets: [ref(growth)] });
    const [offer] = graveyardCasts(game, growth);
    const options = offer.kind === "cast-spell" ? offer.targetOptions[0] : [];
    expect(options).toContainEqual(ref(theirs));
    cast(game, growth, { via: "graveyard-permission", targets: [ref(theirs)] });
    expect(untappedLands(game, forests)).toBe(1);
    expect(zone(game, growth)).toBe("exile");
  });

  it("a spell with no target at all always costs {8} more", () => {
    const { game } = table({ seed: 1 });
    const mavinda = spawn(game, "Mavinda, Students' Advocate");
    const islands = lands(game, "Island", 3);
    const divination = toGraveyard(game, "Divination");
    activate(game, mavinda, 0, { targets: [ref(divination)] });
    expect(graveyardCasts(game, divination)).toHaveLength(0);
    lands(game, "Island", 8);
    const before = hand(game).length;
    cast(game, divination, { via: "graveyard-permission" });
    expect(hand(game).length).toBe(before + 2);
    expect(untappedLands(game, islands)).toBe(0);
    expect(zone(game, divination)).toBe("exile");
  });

  it("cast by its own flashback instead, it's neither taxed nor exiled by Mavinda", () => {
    const { game } = table({ seed: 1 });
    const mavinda = spawn(game, "Mavinda, Students' Advocate");
    const islands = lands(game, "Island", 3);
    const think = toGraveyard(game, "Think Twice");
    activate(game, mavinda, 0, { targets: [ref(think)] });
    // Under Mavinda's permission: {1}{U} and {8} more, more than three lands.
    expect(graveyardCasts(game, think)).toHaveLength(0);
    // Its flashback, {2}{U}: no {8}.
    cast(game, think, { via: "flashback" });
    expect(untappedLands(game, islands)).toBe(0);
    expect(zone(game, think)).toBe("exile");
  });
});
