/**
 * B338 (author-top-cards overnight), decisions lane, agent f: Phyrexian
 * Portal — a target opponent looks at your top ten and separates them; you
 * exile one pile unseen, search the other for a card, and shuffle the rest
 * in. No engine code of its own: `separate-into-piles` of a looked-at
 * `libraryTop` with a `together` fate over the other pile.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, hand, lands, ref, spawn, table, toLibrary, zone } from "./harness.js";

describe("Phyrexian Portal", () => {
  it("the opponent separates the top ten; you exile one pile and search the other for a card", () => {
    const { game, a, b } = table();
    const portal = spawn(game, "Phyrexian Portal");
    lands(game, "Island", 3);
    for (let i = 0; i < 12; i++) toLibrary(game, i % 2 === 0 ? "Grizzly Bears" : "Llanowar Elves");
    const library = [...game.state.zones.perPlayer[A].library];
    const top = library.slice(0, 10);
    const below = library.slice(10);
    let separated: { lookers?: readonly string[]; chooser?: string } | undefined;
    b.separatePilesFn = (_view, offer) => {
      separated = { chooser: offer.chooser };
      expect([...offer.objects].sort()).toEqual([...top].sort());
      return [top.slice(0, 4), top.slice(4)];
    };
    let chosePile = false;
    a.choosePileFn = (_view, offer) => {
      chosePile = true;
      expect(offer.separator).toBe(B);
      expect(offer.faceDown).toBe("both");
      return 0;
    };
    let searched: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      searched = eligible;
      return [eligible[2]];
    };
    const handBefore = hand(game).length;
    activate(game, portal, 0, { targets: [ref(B)] });
    expect(separated?.chooser).toBe("alice");
    expect(chosePile).toBe(true);
    // Two face-down piles: nothing was revealed.
    expect(game.state.eventLog.some((e) => e.type === "cards-revealed")).toBe(false);
    // The first pile exiled.
    for (const id of top.slice(0, 4)) expect(zone(game, id)).toBe("exile");
    // Searched the other pile alone, one card to hand.
    expect([...searched].sort()).toEqual([...top.slice(4)].sort());
    expect(hand(game).length).toBe(handBefore + 1);
    expect(zone(game, searched[2])).toBe("hand");
    // The rest shuffled into the library: all still there, with what was below.
    for (const id of [...top.slice(4).filter((id) => id !== searched[2]), ...below]) expect(zone(game, id)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.length).toBe(library.length - 5);
  });

  it("does nothing with fewer than ten cards in your library", () => {
    // Forty cards, thirty-one of them in hand.
    const { game, b } = table({ openingHandSize: 31 });
    const portal = spawn(game, "Phyrexian Portal");
    lands(game, "Island", 3);
    while (game.state.zones.perPlayer[A].library.length < 9) toLibrary(game, "Grizzly Bears");
    expect(game.state.zones.perPlayer[A].library.length).toBe(9);
    b.separatePilesFn = () => {
      throw new Error("nobody separates with nine cards");
    };
    activate(game, portal, 0, { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[A].library.length).toBe(9);
  });
});
