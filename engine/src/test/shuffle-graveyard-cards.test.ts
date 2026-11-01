/**
 * Shuffling chosen graveyard cards into libraries (rule 701.24a): only the
 * cards matching a filter (`shuffle-graveyard-into-library`'s `filter` —
 * Elixir, Repopulate, Barishi), counted "this way" (`shuffled-into-library`),
 * and target cards into their owners' libraries, each library that got one
 * shuffled (`put-on-libraries`' `"shuffle"` — Turn the Earth, Serene
 * Remembrance, Perpetual Timepiece).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, destroy, graveyard, lands, life, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const shuffles = (game: Game, player: PlayerId): number =>
  game.state.eventLog.filter((e) => e.type === "library-shuffled" && e.player === player).length;

describe("only the matching cards of a graveyard, the library shuffled either way", () => {
  it("Elixir shuffles in the nonland cards and gains a life for each", () => {
    const { game } = table();
    const elixir = spawn(game, "Elixir");
    // It enters tapped; untapped for the test.
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(elixir)]);
    lands(game, "Wastes", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const forest = toGraveyard(game, "Forest");
    const before = shuffles(game, A);
    activate(game, elixir, 0);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, elixir)).toBe("exile");
    expect(life(game)).toBe(22);
    expect(shuffles(game, A)).toBe(before + 1);
  });

  it("Elixir with only lands there gains nothing, and still shuffles", () => {
    const { game } = table();
    const elixir = spawn(game, "Elixir");
    // It enters tapped; untapped for the test.
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(elixir)]);
    lands(game, "Wastes", 5);
    toGraveyard(game, "Forest");
    const before = shuffles(game, A);
    activate(game, elixir, 0);
    expect(life(game)).toBe(20);
    expect(shuffles(game, A)).toBe(before + 1);
  });

  it("Repopulate takes the target player's creature cards into their own library", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const moon = toGraveyard(game, "Bad Moon", B);
    const mine = toGraveyard(game, "Hill Giant", A);
    cast(game, toHand(game, "Repopulate"), { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library).toContain(bears);
    expect(zone(game, moon)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Barishi is exiled first, then the other creature cards go in", () => {
    const { game } = table();
    const barishi = spawn(game, "Barishi");
    const bears = toGraveyard(game, "Grizzly Bears");
    const moon = toGraveyard(game, "Bad Moon");
    destroy(game, barishi);
    expect(zone(game, barishi)).toBe("exile");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, moon)).toBe("graveyard");
  });
});

describe("target cards into their owners' libraries, each shuffled", () => {
  it("Turn the Earth sends each card to its owner's library and shuffles both", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const theirs = toGraveyard(game, "Hill Giant", B);
    const left = toGraveyard(game, "Craw Wurm", B);
    const a0 = shuffles(game, A);
    const b0 = shuffles(game, B);
    cast(game, toHand(game, "Turn the Earth"), { targets: [ref(mine), ref(theirs)] });
    expect(game.state.zones.perPlayer[A].library).toContain(mine);
    expect(game.state.zones.perPlayer[B].library).toContain(theirs);
    expect(zone(game, left)).toBe("graveyard");
    expect(shuffles(game, A)).toBe(a0 + 1);
    expect(shuffles(game, B)).toBe(b0 + 1);
    expect(life(game)).toBe(22);
  });

  it("Turn the Earth's owner with nothing put in doesn't shuffle", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const theirs = toGraveyard(game, "Hill Giant", B);
    const a0 = shuffles(game, A);
    cast(game, toHand(game, "Turn the Earth"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("library");
    expect(shuffles(game, A)).toBe(a0);
  });

  it("Serene Remembrance shuffles itself in with the targets", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const card = toHand(game, "Serene Remembrance");
    const theirs = toGraveyard(game, "Hill Giant", B);
    cast(game, card, { targets: [ref(theirs)] });
    expect(game.state.zones.perPlayer[A].library).toContain(card);
    expect(game.state.zones.perPlayer[B].library).toContain(theirs);
    expect(graveyard(game)).not.toContain(card);
  });

  it("Serene Remembrance with no targets shuffles itself in alone", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const card = toHand(game, "Serene Remembrance");
    const a0 = shuffles(game, A);
    cast(game, card, { targets: [] });
    expect(zone(game, card)).toBe("library");
    expect(shuffles(game, A)).toBe(a0 + 1);
  });

  it("Perpetual Timepiece shuffles any number of your graveyard cards in", () => {
    const { game } = table();
    const piece = spawn(game, "Perpetual Timepiece");
    lands(game, "Wastes", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    activate(game, piece, 1, { targets: [ref(bears), ref(forest)] });
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, forest)).toBe("library");
    expect(zone(game, piece)).toBe("exile");
  });
});
