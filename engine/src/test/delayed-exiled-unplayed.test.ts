/**
 * A card exiled playable for a time, then put into the graveyard by a
 * delayed trigger about the cards exiled this way if it hasn't been played
 * (a played card is a new object, rule 400.7): Elkin Lair (each player's own
 * card, at random from their hand, this turn, then the next end step) and
 * Three Wishes (the top three face down, until your next turn, then your next
 * upkeep).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, settle, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

describe("Elkin Lair", () => {
  it("has the upkeep's player exile a card from hand, playable by them; unplayed, it goes to their graveyard at the end step", () => {
    const { game } = table();
    spawn(game, "Elkin Lair", A);
    game.state.zones.perPlayer[B].hand = [];
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    lands(game, "Forest", 2, A);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "precombat-main", B);
    // Theirs to play, not the Lair's controller's.
    expect(game.legalActions(B).some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(true);
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(false);
    toStep(game, "end", B);
    settle(game);
    expect(graveyard(game, B)).toContain(bears);
  });

  it("a card played from exile stays where it went", () => {
    const { game } = table();
    spawn(game, "Elkin Lair", A);
    game.state.zones.perPlayer[A].hand = [];
    const bears = toHand(game, "Grizzly Bears", A);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "precombat-main", A);
    lands(game, "Forest", 2);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("an empty hand exiles nothing", () => {
    const { game } = table();
    spawn(game, "Elkin Lair", A);
    game.state.zones.perPlayer[B].hand = [];
    toStep(game, "upkeep", B);
    settle(game);
    expect(hand(game, B)).toEqual([]);
    toStep(game, "end", B);
    settle(game);
    expect(graveyard(game, B)).toEqual([]);
  });
});

describe("Three Wishes", () => {
  it("exiles three face down, playable until your next turn; the unplayed go to the graveyard at your next upkeep", () => {
    const { game } = table();
    const forest = toLibrary(game, "Forest", A);
    const bears = toLibrary(game, "Grizzly Bears", A);
    const elves = toLibrary(game, "Llanowar Elves", A);
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Three Wishes"));
    for (const id of [forest, bears, elves]) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].exiledFaceDown?.lookers).toEqual([A]);
    }
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    // On the opponent's turn, still playable at instant speed — none here.
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game, A)).toEqual(expect.arrayContaining([forest, elves]));
  });

  it("playable on the opponent's turn, no longer once your next turn begins", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt", A);
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Three Wishes"));
    expect(zone(game, bolt)).toBe("exile");
    const castable = (): boolean =>
      game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bolt);
    toStep(game, "upkeep", B);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(game.state.turn.step).toBe("upkeep");
    expect(castable()).toBe(true);
    toStep(game, "upkeep", A);
    // The upkeep trigger is on the stack: the permission has already ended.
    expect(castable()).toBe(false);
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
