/**
 * "Choose a creature type and behold two creatures of that type" as an
 * optional additional cost (`BeholdSpec.shareCreatureType`, rules 601.2b,
 * 601.2h, 701.4a): offered only with two creatures that share a type, the
 * two beheld asked first and the type after, only when they share more than
 * one — kept on the spell as its chosen creature type. Celestial Reunion.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, hand, lands, named, pickFromZone, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const casts = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

describe("behold two creatures of a chosen type (Celestial Reunion)", () => {
  it("the beholding cast is offered only with two creatures that share a type", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const reunion = toHand(game, "Celestial Reunion");
    spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears");
    expect(casts(game, reunion).some((c) => c.kicked === true)).toBe(false);
    toHand(game, "Elvish Visionary");
    expect(casts(game, reunion).some((c) => c.kicked === true)).toBe(true);
  });

  it("unbeheld, the found creature goes to the hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const mystic = toLibrary(game, "Elvish Mystic");
    pickFromZone(a, mystic);
    cast(game, toHand(game, "Celestial Reunion"), { x: 1 });
    expect(zone(game, mystic)).toBe("hand");
  });

  it("two that share one type are beheld unasked, and a find of that type enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    let asked = false;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked = true;
      return options[0];
    };
    spawn(game, "Llanowar Elves");
    const visionary = toHand(game, "Elvish Visionary");
    spawn(game, "Grizzly Bears");
    const mystic = toLibrary(game, "Elvish Mystic");
    pickFromZone(a, mystic);
    cast(game, toHand(game, "Celestial Reunion"), { x: 1, kicked: true });
    expect(asked).toBe(false);
    expect(zone(game, mystic)).toBe("battlefield");
    // The card beheld from the hand was revealed and stays there.
    expect(hand(game, A)).toContain(visionary);
  });

  it("two that share two types: the caster names which, and the find is judged by it", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "Druid";
    };
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    // An Elf Shaman: an Elf, but not the chosen Druid.
    const visionary = toLibrary(game, "Elvish Visionary");
    pickFromZone(a, visionary);
    cast(game, toHand(game, "Celestial Reunion"), { x: 2, kicked: true });
    expect([...offered].sort()).toEqual(["Druid", "Elf"]);
    expect(zone(game, visionary)).toBe("hand");
    expect(named(game, "Llanowar Elves")).toHaveLength(2);
  });

  it("the type named is the one read: a Druid find enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    a.chooseCreatureTypeFn = () => "Druid";
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    const mystic = toLibrary(game, "Elvish Mystic");
    pickFromZone(a, mystic);
    cast(game, toHand(game, "Celestial Reunion"), { x: 1, kicked: true });
    expect(zone(game, mystic)).toBe("battlefield");
  });
});
