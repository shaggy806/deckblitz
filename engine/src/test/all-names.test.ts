/**
 * "Has all names of nonlegendary creature cards in addition to its name"
 * (`StaticAbility.addsAllNames`, kept on `GameObject.allNames`): every such
 * name is one the permanent has, beside its own, for anything that reads a
 * name — and the legend rule (704.5j) sees two legends carrying them as named
 * alike.
 *
 * Proving card: Spy Kit.
 */

import { describe, expect, it } from "vitest";

import { namesOf } from "../card-names.js";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, cast, lands, pt, ref, registryOf, settle, spawn, table, toHand, zone } from "./harness.js";

const equip = (game: Game, kit: ObjectId, creature: ObjectId): void => {
  lands(game, "Wastes", 2);
  activate(game, kit, 0, { targets: [ref(creature)] });
};

describe("all names of nonlegendary creature cards", () => {
  it("Spy Kit: the equipped creature has every nonlegendary creature card's name and its own, +1/+1", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const kit = spawn(game, "Spy Kit", A);
    equip(game, kit, bears);
    settle(game);
    const named = (name: string): boolean =>
      matchesFilter(game.state, registryOf(game), bears, { name }, { you: A });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(named("Grizzly Bears")).toBe(true);
    expect(named("Llanowar Elves")).toBe(true);
    expect(named("Serra Angel")).toBe(true);
    // Not a legendary creature's, nor a noncreature card's.
    expect(named("Isamaru, Hound of Konda")).toBe(false);
    expect(named("Lightning Bolt")).toBe(false);
    // The Kit itself is not named so.
    expect(namesOf(registryOf(game), game.state.objects[kit])).toEqual(["Spy Kit"]);
  });

  it("the names go when the Kit does", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const kit = spawn(game, "Spy Kit", A);
    equip(game, kit, bears);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Disenchant"), { targets: [ref(kit)] });
    expect(zone(game, kit)).toBe("graveyard");
    expect(namesOf(registryOf(game), game.state.objects[bears])).toEqual(["Grizzly Bears"]);
  });

  it("the legend rule: two legends each carrying a Kit share a name, and one goes (704.5j)", () => {
    const { game, a } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda", A);
    const other = spawn(game, "Kytheon, Hero of Akros", A);
    const kits = [spawn(game, "Spy Kit", A), spawn(game, "Spy Kit", A)];
    equip(game, kits[0], isamaru);
    settle(game);
    // One legend with the names shares none with a legend of another name.
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(zone(game, other)).toBe("battlefield");
    a.chooseLegendToKeepFn = (_view, _name, options) => options[0];
    equip(game, kits[1], other);
    settle(game);
    expect([zone(game, isamaru), zone(game, other)].filter((z) => z === "graveyard")).toHaveLength(1);
  });
});
