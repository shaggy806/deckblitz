/**
 * Embalm and eternalize as kinds of ability (rules 702.128a, 702.129a):
 * `ActivatedAbility.keywordAbility`, read by `activates-ability`'s
 * `keywordAbility` ("whenever you activate an eternalize or embalm ability")
 * and by `CardFilter.hasKeyword` ("a creature card with eternalize or
 * embalm") — Vizier of the Anointed.
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import { A, B, activate, enter, graveyard, hand, lands, nextTurn, pickFromZone, pickModes, settle, table, toGraveyard, toLibrary, zone } from "./harness.js";

const WITH = { type: "creature" as const, anyOf: [{ hasKeyword: "eternalize" as const }, { hasKeyword: "embalm" as const }] };

describe("hasKeyword embalm / eternalize", () => {
  it("names a card with either, and not one without", () => {
    const { game } = table();
    const cat = toLibrary(game, "Sacred Cat");
    const fanatic = toLibrary(game, "Fanatic of Rhonas");
    const bears = toLibrary(game, "Grizzly Bears");
    const read = (id: string) => matchesFilter(game.state, game.registry, id as never, WITH, { you: A });
    expect(read(cat)).toBe(true);
    expect(read(fanatic)).toBe(true);
    expect(read(bears)).toBe(false);
    expect(matchesFilter(game.state, game.registry, cat, { hasKeyword: "eternalize" }, { you: A })).toBe(false);
  });
});

describe("Vizier of the Anointed", () => {
  it("searches out only a creature card with eternalize or embalm, into the graveyard", () => {
    const { game, a } = table();
    const cat = toLibrary(game, "Sacred Cat");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, cat);
    enter(game, "Vizier of the Anointed");
    expect(seen.offered).toContain(cat);
    expect(seen.offered.every((id) => ["Sacred Cat"].includes(game.state.objects[id].cardName))).toBe(true);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Sacred Cat")).toBe(true);
  });

  it("draws for an embalm and an eternalize ability you activate", () => {
    const { game } = table();
    enter(game, "Vizier of the Anointed");
    const cat = toGraveyard(game, "Sacred Cat");
    const fanatic = toGraveyard(game, "Fanatic of Rhonas");
    lands(game, "Plains", 1);
    const before = hand(game).length;
    activate(game, cat, 0);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    lands(game, "Forest", 6);
    activate(game, fanatic, 2);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });

  it("doesn't draw for another graveyard ability, nor an opponent's embalm", () => {
    const { game } = table();
    enter(game, "Vizier of the Anointed");
    const corpse = toGraveyard(game, "Corpse Connoisseur");
    lands(game, "Swamp", 4);
    const before = hand(game).length;
    activate(game, corpse, 0);
    settle(game);
    expect(hand(game).length).toBe(before);
    const theirs = toGraveyard(game, "Sacred Cat", B);
    lands(game, "Plains", 1, B);
    nextTurn(game);
    const mine = hand(game).length;
    activate(game, theirs, 0, { player: B });
    settle(game);
    expect(zone(game, theirs)).toBe("exile");
    expect(hand(game).length).toBe(mine);
  });
});
