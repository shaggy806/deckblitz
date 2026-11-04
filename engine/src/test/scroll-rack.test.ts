/**
 * Scroll Rack's swap: "exile any number of cards from your hand face down. Put
 * that many cards from the top of your library into your hand. Then look at
 * the exiled cards and put them on top of your library in any order."
 *
 * The new part is `look-and-choose`'s `zone: "exiled-this-way"`: the cards this
 * resolution exiled, the chooser looking at them though they're face down (rule
 * 406.3) and so picking each by name rather than a group's at random, in order
 * (rule 401.4). And a commander going from exile into a library is asked 903.9b
 * before anything moves, as one going from a hand is.
 */
import { describe, expect, it } from "vitest";

import { autoSettle, forcedZoneChoice } from "../auto-settle.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, hand, lands, life, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";
import type { Table } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

/** The opening hand goes to the library's bottom, so a hand holds what a test put there. */
function emptyHand(game: Game): void {
  const zones = game.state.zones.perPlayer[A];
  for (const id of zones.hand.splice(0)) {
    game.state.objects[id].zone = "library";
    zones.library.push(id);
  }
}

/** A Rack with its mana, and a seat answering: the cards to exile, then the
 * order they go back in; the forced take from the library in between. */
function rack(t: Table, exile: readonly ObjectId[], order: readonly ObjectId[] = exile): { offered: (readonly ObjectId[])[] } {
  lands(t.game, "Mountain", 1);
  const seen = { offered: [] as (readonly ObjectId[])[] };
  t.a.chooseFromZoneFn = (_view, eligible) => {
    seen.offered.push(eligible);
    const awaiting = t.game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") return [];
    if (awaiting.destination === "exile-face-down") return exile;
    if (awaiting.destination === "hand") return eligible;
    return order;
  };
  return seen;
}

describe("Scroll Rack", () => {
  it("swaps cards from hand with the top of the library, the exiled ones on top in the order picked", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const [one, two, keep] = [toHand(game, "Grizzly Bears"), toHand(game, "Lightning Bolt"), toHand(game, "Forest")];
    const second = toLibrary(game, "Island");
    const first = toLibrary(game, "Swamp");
    const deep = toLibrary(game, "Plains");
    // The top of the library is index 0: Plains, Swamp, Island.
    expect(library(game).slice(0, 3)).toEqual([deep, first, second]);
    const drawnBefore = game.state.players[A].cardsDrawnThisTurn;
    const seen = rack(t, [one, two], [two, one]);

    activate(game, rackId);

    expect(game.state.awaiting).toBeNull();
    expect(hand(game)).toEqual(expect.arrayContaining([keep, deep, first]));
    expect(hand(game)).toHaveLength(3);
    expect(library(game).slice(0, 3)).toEqual([two, one, second]);
    expect(zone(game, rackId)).toBe("battlefield");
    expect(game.state.objects[rackId].tapped).toBe(true);
    // Not a draw (the ruling).
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(drawnBefore);
    // The order was asked of the two cards exiled, by name.
    expect(seen.offered.at(-1)).toEqual(expect.arrayContaining([one, two]));
  });

  it("asks nothing about one card going back, and takes the one from the top first", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const one = toHand(game, "Grizzly Bears");
    const top = toLibrary(game, "Swamp");
    const seen = rack(t, [one]);

    activate(game, rackId);

    expect(hand(game)).toEqual([top]);
    expect(library(game)[0]).toBe(one);
    expect(seen.offered).toHaveLength(2); // the exile and the take, no order
  });

  it("does nothing more when none is exiled", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const one = toHand(game, "Grizzly Bears");
    const top = toLibrary(game, "Swamp");
    rack(t, []);

    activate(game, rackId);

    expect(game.state.objects[rackId].tapped).toBe(true);
    expect(hand(game)).toEqual([one]);
    expect(library(game)[0]).toBe(top);
  });

  it("gives what's there from a short library, and its owner doesn't lose (the ruling)", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const [one, two] = [toHand(game, "Grizzly Bears"), toHand(game, "Lightning Bolt")];
    game.state.zones.perPlayer[A].library.splice(1);
    const last = library(game)[0];
    rack(t, [one, two]);

    activate(game, rackId);

    expect(game.state.players[A].hasLost).toBe(false);
    expect(hand(game)).toEqual([last]);
    expect(library(game)).toEqual([one, two]);
  });

  it("with an empty library, the exiled cards still go back", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const one = toHand(game, "Grizzly Bears");
    game.state.zones.perPlayer[A].library.length = 0;
    rack(t, [one]);

    activate(game, rackId);

    expect(hand(game)).toEqual([]);
    expect(library(game)).toEqual([one]);
    expect(life(game)).toBe(20);
  });

  it("hides the exiled cards from an opponent while the order is asked, and shows them to the chooser", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const [one, two] = [toHand(game, "Grizzly Bears"), toHand(game, "Lightning Bolt")];
    lands(game, "Mountain", 1);
    t.a.chooseFromZoneFn = (_view, eligible) => {
      const awaiting = game.state.awaiting;
      if (awaiting?.kind === "choose-from-zone" && awaiting.destination === "exile-face-down") return [one, two];
      return eligible;
    };
    activate(game, rackId, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone" && s.awaiting.destination === "library-top");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-from-zone" ? awaiting.faceDownGroups : "none").toBeUndefined();
    expect(forcedZoneChoice(game.state)).toBeNull();
    expect(game.state.objects[one].zone).toBe("exile");
    expect(game.state.objects[one].exiledFaceDown).toBeDefined();
    expect(game.viewFor(A).objects[one]?.cardName).toBe("Grizzly Bears");
    expect(game.viewFor(B).objects[one]?.cardName).not.toBe("Grizzly Bears");
    autoSettle(game);
  });

  it("asks a commander's owner 903.9b as it goes from exile to the library, without moving the rest first", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const commander = toHand(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const other = toHand(game, "Lightning Bolt");
    rack(t, [commander, other], [commander, other]);

    activate(game, rackId, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "commander-replacement");
    expect(game.state.objects[commander].zone).toBe("exile");
    expect(game.state.objects[other].zone).toBe("exile");
    game.dispatch({ type: "commander-replacement", player: A, toCommandZone: false });
    settle(game);

    expect(library(game).slice(0, 2)).toEqual([commander, other]);
    expect(game.state.awaiting).toBeNull();
  });

  it("puts the commander in the command zone if its owner says so, the other card still going back", () => {
    const t = table();
    const { game } = t;
    const rackId = spawn(game, "Scroll Rack");
    emptyHand(game);
    const commander = toHand(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const other = toHand(game, "Lightning Bolt");
    rack(t, [commander, other], [commander, other]);

    activate(game, rackId, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "commander-replacement");
    game.dispatch({ type: "commander-replacement", player: A, toCommandZone: true });
    settle(game);

    expect(zone(game, commander)).toBe("command");
    expect(library(game)[0]).toBe(other);
  });
});
