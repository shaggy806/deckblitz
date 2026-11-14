/**
 * "You may cast this card from your graveyard using its [mutate / bestow]
 * ability" (`PlayTerms.using` — Brokkos, Apex of Forever; Detective's
 * Phoenix): a permission whose casts pay only that keyword's cost, never the
 * mana cost or another alternative cost (the rulings; rule 118.9a), at the
 * card's usual timing. And a bestow cost that also collects evidence
 * (Detective's Phoenix's "Bestow—{R}, Collect evidence 6", rule 701.59a):
 * paid with the spell on the stack (601.2h), so never with the card itself.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, cast, graveyard, keywords, lands, pickFromZone, pickModes, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

const ON_TOP = 0;

describe("Brokkos, Apex of Forever: cast from the graveyard using its mutate ability", () => {
  it("is offered from the graveyard only for its mutate cost, and merges", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const brokkos = toGraveyard(game, "Brokkos, Apex of Forever");
    const offers = castOffers(game, brokkos);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((o) => o.overload === true && o.overloadKeyword === "mutate" && o.via === "graveyard-permission")).toBe(true);
    pickModes(a, ON_TOP);
    cast(game, brokkos, { via: "graveyard-permission", overload: true, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(printedCardName(game.state.objects[bears])).toBe("Brokkos, Apex of Forever");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });

  it("can't be cast from the graveyard for its mana cost, nor with no creature to mutate onto", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const brokkos = toGraveyard(game, "Brokkos, Apex of Forever");
    expect(castOffers(game, brokkos)).toEqual([]);
    expect(() => cast(game, brokkos, { via: "graveyard-permission" })).toThrow(/only using its mutate ability/);
  });

  it("from the hand it's cast either way, as usual", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const brokkos = toHand(game, "Brokkos, Apex of Forever");
    const offers = castOffers(game, brokkos);
    expect(offers.some((o) => o.overload !== true)).toBe(true);
    expect(offers.some((o) => o.overload === true)).toBe(true);
  });
});

describe("Detective's Phoenix: bestow with collect evidence, and from the graveyard", () => {
  it("bestowed from the graveyard: {R} and evidence 6, never the Phoenix itself", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Detective's Phoenix");
    const big = toGraveyard(game, "Craterhoof Behemoth"); // mana value 8
    const offers = castOffers(game, phoenix);
    expect(offers.length).toBe(1);
    expect(offers[0]).toMatchObject({ overload: true, overloadKeyword: "bestow", overloadCost: "{R}, collect evidence 6" });
    const seen = pickFromZone(a, big);
    cast(game, phoenix, { via: "graveyard-permission", overload: true, targets: [ref(bears)] });
    expect(seen.offered).toEqual([big]);
    expect(zone(game, big)).toBe("exile");
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(game.state.objects[phoenix].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("isn't offered bestowed without mana value 6 in the graveyard besides it", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const phoenix = toGraveyard(game, "Detective's Phoenix");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears"); // 2 + 2, and the Phoenix's own 3 doesn't count
    expect(castOffers(game, phoenix)).toEqual([]);
    toGraveyard(game, "Grizzly Bears");
    expect(castOffers(game, phoenix).length).toBe(1);
  });

  it("from the hand: its mana cost, or bestowed with evidence", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const phoenix = toHand(game, "Detective's Phoenix");
    expect(castOffers(game, phoenix).map((o) => o.overload === true)).toEqual([false]);
    const dead = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    expect(castOffers(game, phoenix).map((o) => o.overload === true).sort()).toEqual([false, true]);
    pickFromZone(a, ...dead);
    cast(game, phoenix, { overload: true, targets: [ref(bears)] });
    expect(graveyard(game).filter((id) => dead.includes(id))).toEqual([]);
    expect(game.state.objects[phoenix].attachedTo).toBe(bears);
  });
});
