import { describe, expect, it } from "vitest";
import { A, B, cast, graveyard, lands, ref, table, toHand, toLibrary } from "./harness.js";

// `reveal-until`'s `ifNone`: where the revealed cards go when nothing matched,
// instead of `rest` — Tunnel Vision's "if it is, that player puts the rest of
// the revealed cards into their graveyard and puts the card with the chosen
// name on top of their library. Otherwise, the player shuffles."

const shufflesOf = (game: ReturnType<typeof table>["game"], player = B): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

describe("reveal until, else shuffle — Tunnel Vision", () => {
  it("found: the cards above the named one go to the graveyard, it's left on top, and nothing is shuffled", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    const island = toLibrary(game, "Island", B);
    const forest = toLibrary(game, "Forest", B);
    const libraryBefore = game.state.zones.perPlayer[B].library.length;
    lands(game, "Island", 6);
    a.chooseCardNameFn = () => "Grizzly Bears";
    cast(game, toHand(game, "Tunnel Vision"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([forest, island]));
    expect(graveyard(game, B)).toHaveLength(2);
    const library = game.state.zones.perPlayer[B].library;
    expect(library[0]).toBe(bears);
    expect(library).toHaveLength(libraryBefore - 2);
    expect(shufflesOf(game)).toBe(0);
  });

  it("not found: nothing goes to the graveyard and the target player shuffles", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    const libraryBefore = game.state.zones.perPlayer[B].library.length;
    lands(game, "Island", 6);
    a.chooseCardNameFn = () => "Lightning Bolt";
    cast(game, toHand(game, "Tunnel Vision"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(0);
    expect(game.state.zones.perPlayer[B].library).toHaveLength(libraryBefore);
    expect(shufflesOf(game)).toBe(1);
    expect(shufflesOf(game, A)).toBe(0);
  });

  it("the named card on top already: nothing goes to the graveyard and it stays there", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    a.chooseCardNameFn = () => "Grizzly Bears";
    cast(game, toHand(game, "Tunnel Vision"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(0);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bears);
    expect(shufflesOf(game)).toBe(0);
  });
});
