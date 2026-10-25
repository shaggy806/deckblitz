/**
 * Alliances, the lead's cards: the `exileTop` activation cost ("Exile the top
 * N cards of your library" — Royal Herbalist, Whirling Catapult, Seasoned
 * Tactician) and Dystopia's life-paid cumulative upkeep.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, graveyard, lands, life, nextTurn, pickModes, spawn, table, toStep } from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = A) => game.state.zones.perPlayer[player].library;

describe("exileTop cost", () => {
  it("Royal Herbalist exiles the top card of its controller's library as it's activated", () => {
    const { game } = table();
    const herbalist = spawn(game, "Royal Herbalist");
    lands(game, "Plains", 2);
    const top = library(game)[0];
    const before = library(game).length;
    activate(game, herbalist, 0, { settle: false });
    // Paid as it's activated, before the ability resolves.
    expect(library(game).length).toBe(before - 1);
    expect(game.state.objects[top].zone).toBe("exile");
    expect(game.state.zones.shared.stack.length).toBe(1);
    toStep(game, "postcombat-main");
    expect(life(game, A)).toBe(21);
  });

  it("can't be paid with fewer cards in the library than it exiles", () => {
    const { game } = table();
    const catapult = spawn(game, "Whirling Catapult");
    lands(game, "Wastes", 2);
    game.state.zones.perPlayer[A].library.splice(1);
    expect(() => activate(game, catapult)).toThrow();
    expect(library(game).length).toBe(1);
  });

  it("Whirling Catapult exiles two and deals 1 to each flier and each player", () => {
    const { game } = table();
    const catapult = spawn(game, "Whirling Catapult");
    const bird = spawn(game, "Suntail Hawk", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    const before = library(game).length;
    activate(game, catapult);
    expect(library(game).length).toBe(before - 2);
    expect(graveyard(game, B)).toContain(bird);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Dystopia", () => {
  it("pays 1 life per age counter, and each player sacrifices a green or white permanent at their upkeep", () => {
    const { game, a } = table();
    spawn(game, "Dystopia");
    const lions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears");
    // Bob's upkeep: he sacrifices his only white permanent.
    nextTurn(game);
    expect(graveyard(game, B)).toContain(lions);
    // Alice's upkeep: one age counter, 1 life paid; and her Bears go.
    pickModes(a, 0);
    nextTurn(game);
    expect(life(game, A)).toBe(19);
    expect(graveyard(game, A)).toContain(bears);
  });
});
