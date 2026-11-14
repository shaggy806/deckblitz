/**
 * "…any number of cards **with different mana values**" — a `look-and-choose`'s
 * `together: { distinctManaValues: true }` (Seasons Past), chosen as it
 * resolves, and the targeted form's `differentManaValues` (Long Rest). An {X}
 * in a card's cost counts 0 off the stack and a land's mana value is 0 (rule
 * 202.3a, 202.3e).
 */
import { describe, expect, it } from "vitest";

import { A, cast, hand, lands, life, pickFromZone, ref, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Seasons Past", () => {
  it("returns any number with different mana values, then goes to the bottom of its owner's library", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const bears = toGraveyard(game, "Grizzly Bears");
    const elves = toGraveyard(game, "Llanowar Elves");
    const otherBears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    // Fireball's {X} counts 0 in the graveyard: it shares a mana value of 1 with the Elves.
    const fireball = toGraveyard(game, "Fireball");
    const seasons = toHand(game, "Seasons Past");
    const seen = pickFromZone(a, bears, elves, forest);
    cast(game, seasons);
    expect([...seen.offered].sort()).toEqual([bears, elves, otherBears, forest, fireball].sort());
    expect([bears, elves, forest].map((id) => zone(game, id))).toEqual(["hand", "hand", "hand"]);
    expect(zone(game, otherBears)).toBe("graveyard");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(seasons);
  });

  it("two with the same mana value can't both be chosen", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const elves = toGraveyard(game, "Llanowar Elves");
    const fireball = toGraveyard(game, "Fireball");
    const seasons = toHand(game, "Seasons Past");
    // Asked for both, the pick is held to the rule: one of the two comes back.
    pickFromZone(a, elves, fireball);
    cast(game, seasons);
    expect([elves, fireball].filter((id) => zone(game, id) === "hand")).toHaveLength(1);
  });
});

describe("Long Rest", () => {
  it("X targets with different mana values; fewer than eight back, life unchanged; exiled", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    game.state.players[A].life = 7;
    const bears = toGraveyard(game, "Grizzly Bears");
    const elves = toGraveyard(game, "Llanowar Elves");
    const rest = toHand(game, "Long Rest");
    cast(game, rest, { x: 2, targets: [ref(bears), ref(elves)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, elves)).toBe("hand");
    expect(life(game)).toBe(7);
    expect(zone(game, rest)).toBe("exile");
  });

  it("targets sharing a mana value aren't a legal choice", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const other = toGraveyard(game, "Grizzly Bears");
    const rest = toHand(game, "Long Rest");
    expect(() => cast(game, rest, { x: 2, targets: [ref(bears), ref(other)] })).toThrow(/target/i);
  });

  it("eight or more returned: your life total becomes your starting life total", () => {
    const { game } = table();
    lands(game, "Forest", 11);
    game.state.players[A].life = 3;
    const cards = [
      toGraveyard(game, "Forest"),
      toGraveyard(game, "Llanowar Elves"),
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Hill Giant"),
      toGraveyard(game, "Serra Angel"),
      toGraveyard(game, "Craw Wurm"),
      toGraveyard(game, "Pelakka Wurm"),
      toGraveyard(game, "Hurloon Minotaur"),
    ];
    const before = hand(game).length;
    const rest = toHand(game, "Long Rest");
    cast(game, rest, { x: 8, targets: cards.map(ref) });
    expect(hand(game)).toHaveLength(before + 8);
    expect(life(game)).toBe(20);
  });
});
