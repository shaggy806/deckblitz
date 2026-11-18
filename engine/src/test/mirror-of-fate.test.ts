/**
 * Mirror of Fate: a `look-and-choose` over your face-up exiled cards that
 * moves nothing (`destination: "stay"`), then — chosen or not (`thenAlways`)
 * — the library is exiled and the chosen cards go on top, their owner
 * arranging them (rule 401.4).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, activate, B, spawn, table, toExile, toLibrary, zone } from "./harness.js";

describe("Mirror of Fate", () => {
  it("exiles the library, then puts the chosen face-up exiled cards on top in the order you choose", () => {
    const { game, a } = table();
    const mirror = spawn(game, "Mirror of Fate");
    const giant = toExile(game, "Hill Giant");
    const bears = toExile(game, "Grizzly Bears");
    const left = toExile(game, "Gray Ogre");
    const hidden = toExile(game, "Llanowar Elves");
    game.state.objects[hidden].exiledFaceDown = { lookers: [A] };
    const theirs = toExile(game, "Elvish Mystic", B);
    const deck = [toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    const offers: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      // First the choice, then the order: Grizzly Bears on top.
      return offers.length === 1 ? [giant, bears] : [bears, giant];
    };
    activate(game, mirror);
    // Only face-up cards you own: not the face-down one, not Bob's.
    expect([...offers[0]].sort()).toEqual([giant, bears, left].sort());
    expect(zone(game, mirror)).toBe("graveyard");
    for (const card of deck) expect(zone(game, card)).toBe("exile");
    expect(zone(game, left)).toBe("exile");
    expect(zone(game, hidden)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.zones.perPlayer[A].library).toEqual([bears, giant]);
  });

  it("exiles the library with nothing chosen", () => {
    const { game, a } = table();
    const mirror = spawn(game, "Mirror of Fate");
    toExile(game, "Hill Giant");
    const deck = [toLibrary(game, "Forest"), toLibrary(game, "Island")];
    a.chooseFromZoneFn = () => [];
    activate(game, mirror);
    for (const card of deck) expect(zone(game, card)).toBe("exile");
    expect(game.state.zones.perPlayer[A].library).toEqual([]);
  });

  it("exiles the library with no exiled card to choose", () => {
    const { game } = table();
    const mirror = spawn(game, "Mirror of Fate");
    const deck = [toLibrary(game, "Forest")];
    activate(game, mirror);
    expect(zone(game, deck[0])).toBe("exile");
  });
});
