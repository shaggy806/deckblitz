/**
 * What would go to a graveyard going elsewhere: a creature's own "would die, put
 * it on top of its owner's library instead" (Gravebane Zombie), "and it wasn't
 * cycled, exile it instead" (Abandoned Sarcophagus), and a discard its player may
 * put on top of their library (Library of Leng, Nephalia Academy), which is still
 * a discard.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, destroy, graveyard, hand, lands, life, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const discardEvents = (game: Game): number => game.state.eventLog.filter((e) => e.type === "cards-discarded").length;

/** On Bob's turn, Bob's Mind Rot at Alice, who has `cards` in hand and discards the
 * first two of them, up to her answer. */
function bobMindRots(game: Game, seat: ScriptedController, cards: readonly string[]): ObjectId[] {
  const ids = cards.map((name) => toHand(game, name));
  seat.chooseDiscardsFn = () => ids.slice(0, 2);
  nextTurn(game);
  lands(game, "Swamp", 3, B);
  cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)] });
  return ids;
}

describe("Gravebane Zombie: would die, on top of its owner's library", () => {
  it("destroyed, it's on top and it never died", () => {
    const { game } = table();
    const zombie = spawn(game, "Gravebane Zombie");
    spawn(game, "Blood Artist");
    destroy(game, zombie);
    settle(game);
    expect(library(game)[0]).toBe(zombie);
    expect(life(game)).toBe(20);
    expect(graveyard(game)).toEqual([]);
  });

  it("only dying: discarded, it goes to the graveyard", () => {
    const { game, a } = table();
    const zombie = toHand(game, "Gravebane Zombie");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [zombie, bears];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(A)] });
    expect(zone(game, zombie)).toBe("graveyard");
  });

  it("is an ability of its own: lost, it dies", () => {
    const { game } = table();
    const zombie = spawn(game, "Gravebane Zombie");
    spawn(game, "Humility");
    destroy(game, zombie);
    settle(game);
    expect(zone(game, zombie)).toBe("graveyard");
  });
});

describe("Abandoned Sarcophagus", () => {
  it("a card cycled goes to the graveyard, and can be cast from there", () => {
    const { game } = table();
    spawn(game, "Abandoned Sarcophagus");
    lands(game, "Plains", 5);
    const faith = toHand(game, "Renewed Faith");
    game.dispatch({ type: "cycle", player: A, card: faith });
    settle(game);
    expect(zone(game, faith)).toBe("graveyard");
    cast(game, faith, { via: "graveyard-permission" });
    // Resolved, it would go back, and it wasn't cycled this time.
    expect(zone(game, faith)).toBe("exile");
    expect(life(game)).toBe(26);
  });

  it("a card with cycling discarded any other way is exiled", () => {
    const { game, a } = table();
    spawn(game, "Abandoned Sarcophagus");
    const faith = toHand(game, "Renewed Faith");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [faith, bears];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(A)] });
    expect(zone(game, faith)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("only your graveyard, and only cards with cycling can be cast", () => {
    const { game } = table();
    spawn(game, "Abandoned Sarcophagus");
    const theirs = toGraveyard(game, "Renewed Faith", B);
    lands(game, "Plains", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && (a.card === theirs || a.card === bears))).toBe(false);
  });
});

describe("Library of Leng: a discard its player may put on top", () => {
  it("offers the discard, the first picked on top, and it's still one discard", () => {
    const { game, a } = table();
    spawn(game, "Library of Leng");
    a.chooseFromZoneFn = (_view, ids) => {
      expect(ids.length).toBe(2);
      return [ids[1], ids[0]];
    };
    const [first, second] = bobMindRots(game, a, ["Grizzly Bears", "Llanowar Elves"]);
    expect(library(game).slice(0, 2)).toEqual([second, first]);
    expect(graveyard(game)).toEqual([]);
    expect(discardEvents(game)).toBe(1);
    expect(hand(game)).not.toContain(first);
  });

  it("the ones not picked go to the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Library of Leng");
    a.chooseFromZoneFn = (_view, ids) => [ids[0]];
    const [first, second] = bobMindRots(game, a, ["Grizzly Bears", "Llanowar Elves"]);
    expect(library(game)[0]).toBe(first);
    expect(zone(game, second)).toBe("graveyard");
    expect(discardEvents(game)).toBe(1);
  });

  it("what follows waits for the answer: Windfall can redraw what's put back", () => {
    const { game, a } = table();
    spawn(game, "Library of Leng");
    lands(game, "Island", 3);
    const windfall = toHand(game, "Windfall");
    const bears = toHand(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    a.chooseFromZoneFn = (_view, ids) => [...ids];
    const inHand = hand(game).length;
    cast(game, windfall);
    // All of it back on top, in the order offered, and drawn again.
    expect(hand(game)).toEqual(expect.arrayContaining([bears, elves]));
    expect(hand(game).length).toBe(inHand - 1);
    expect(graveyard(game)).toEqual([windfall]);
  });

  it("a cost isn't an effect: nothing is asked", () => {
    const { game, a } = table();
    spawn(game, "Library of Leng");
    const mongrel = spawn(game, "Wild Mongrel");
    const bears = toHand(game, "Grizzly Bears");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    a.chooseDiscardsFn = () => [bears];
    activate(game, mongrel, 0);
    expect(asked).toBe(false);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a card with madness picked for the library escapes madness", () => {
    const { game, a } = table();
    spawn(game, "Library of Leng");
    a.chooseFromZoneFn = (_view, ids) => [...ids];
    const [temper] = bobMindRots(game, a, ["Fiery Temper", "Grizzly Bears"]);
    expect(zone(game, temper)).toBe("library");
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});

describe("Nephalia Academy: an opponent's discard only, revealed", () => {
  it("offers an opponent's, and reveals what it puts back", () => {
    const { game, a } = table();
    spawn(game, "Nephalia Academy");
    a.chooseFromZoneFn = (_view, ids) => [ids[0]];
    const [first] = bobMindRots(game, a, ["Grizzly Bears", "Llanowar Elves"]);
    expect(library(game)[0]).toBe(first);
    expect(game.state.eventLog.some((e) => e.type === "cards-revealed" && e.objects.includes(first))).toBe(true);
  });

  it("doesn't offer your own", () => {
    const { game, a } = table();
    spawn(game, "Nephalia Academy");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    const bears = toHand(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    a.chooseDiscardsFn = () => [bears, elves];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(A)] });
    expect(asked).toBe(false);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("taps for colourless", () => {
    const { game } = table();
    const academy = spawn(game, "Nephalia Academy");
    activate(game, academy, 0);
    expect(game.state.objects[academy].tapped).toBe(true);
  });
});
