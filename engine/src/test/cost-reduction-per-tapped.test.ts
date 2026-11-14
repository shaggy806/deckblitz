/**
 * "As an additional cost to cast this spell, you may tap any number of
 * untapped creatures you control. This spell costs {1} less to cast for each
 * creature tapped this way" (`tapAnyNumber.reducesGeneric`): generic mana off
 * the total cost per creature tapped (rule 601.2f), never the coloured part,
 * any number still tappable past that (the ruling). The offer's `count` is
 * the fewest that leave the rest payable. Explosive Singularity, written from
 * the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

const SINGULARITY = "Explosive Singularity";

const castOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .filter((o) => o.kind === "cast-spell" && o.card === card) as Extract<
    ReturnType<Game["legalActions"]>[number],
    { kind: "cast-spell" }
  >[];

const creatures = (game: Game, n: number): ObjectId[] => Array.from({ length: n }, () => spawn(game, "Grizzly Bears"));

const untappedLands = (game: Game): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.cardName === "Mountain" && !o.tapped;
  }).length;

describe("Explosive Singularity", () => {
  it("costs {1} less for each creature tapped: two Mountains and eight creatures cast it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const team = creatures(game, 8);
    const card = toHand(game, SINGULARITY);
    const [offer] = castOffers(game, card);
    expect(offer?.tapCost).toMatchObject({ anyNumber: true, count: 8 });
    cast(game, card, { targets: [ref(B)], tap: team });
    expect(life(game, B)).toBe(10);
    expect(zone(game, card)).toBe("graveyard");
    expect(team.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(untappedLands(game)).toBe(0);
  });

  it("with mana enough, tapping none is a legal payment", () => {
    const { game } = table();
    lands(game, "Mountain", 10);
    creatures(game, 2);
    const card = toHand(game, SINGULARITY);
    expect(castOffers(game, card)[0]?.tapCost).toMatchObject({ count: 0 });
    cast(game, card, { targets: [ref(B)], tap: [] });
    expect(life(game, B)).toBe(10);
    expect(untappedLands(game)).toBe(0);
  });

  it("too few tapped leaves the mana short; more than it needs may still be tapped", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const team = creatures(game, 6);
    const card = toHand(game, SINGULARITY);
    // {8}{R}{R} less five is {3}{R}{R}: five Mountains.
    expect(castOffers(game, card)[0]?.tapCost).toMatchObject({ count: 5 });
    expect(() => cast(game, card, { targets: [ref(B)], tap: team.slice(0, 4) })).toThrow(/cannot pay/);
    cast(game, card, { targets: [ref(B)], tap: team });
    expect(life(game, B)).toBe(10);
    expect(team.every((id) => game.state.objects[id].tapped)).toBe(true);
    // Six off {8}: {2}{R}{R}, so a Mountain is left.
    expect(untappedLands(game)).toBe(1);
  });

  it("never takes off the {R}{R}", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    creatures(game, 10);
    const card = toHand(game, SINGULARITY);
    expect(castOffers(game, card)).toEqual([]);
  });

  it("a driver that doesn't choose taps no more than takes something off", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const team = creatures(game, 10);
    const card = toHand(game, SINGULARITY);
    cast(game, card, { targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
    expect(team.filter((id) => game.state.objects[id].tapped)).toHaveLength(8);
  });
});
