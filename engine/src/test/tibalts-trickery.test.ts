/**
 * Tibalt's Trickery: another player, the countered spell's controller, casts
 * what the effect turns up (`cast-now`'s `by`), read through a spell that has
 * left the stack: its controller, and its name as it last was there.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, cast, graveyard, lands, nextTurn, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";

/** Bob's spell on the stack, and Alice's Trickery on it, not yet resolved. */
const trickery = (game: Game, spell: ObjectId, by: PlayerId = A): ObjectId => {
  lands(game, "Mountain", 2, by);
  const card = toHand(game, "Tibalt's Trickery", by);
  for (let i = 0; i < 4 && game.state.priority.holder !== by; i++) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder as PlayerId });
  }
  cast(game, card, { player: by, targets: [ref(spell)], settle: false });
  return card;
};

/** Bob's creature spell, on his turn. */
const bobCasts = (game: Game, name: string, land: string, n: number): ObjectId => {
  nextTurn(game);
  lands(game, land, n, B);
  const card = toHand(game, name, B);
  cast(game, card, { player: B, settle: false });
  return card;
};

/** Bob takes the free cast when it's offered, recording what was offered. */
const takesFreeCast = (seat: ScriptedController): { offered: ObjectId | null } => {
  const seen = { offered: null as ObjectId | null };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered = offer.cards[0];
    return { type: "cast-spell", player: seat.playerId, card: offer.cards[0], targets: [], via: "effect", free: true };
  };
  return seen;
};

/** A library for Bob whose cards from the top are these names, nothing below. */
const stackLibrary = (game: Game, names: readonly string[]): ObjectId[] => {
  const library = game.state.zones.perPlayer[B].library;
  for (const id of [...library]) {
    game.state.zones.shared.exile.push(id);
    game.state.objects[id].zone = "exile";
  }
  library.length = 0;
  const cards = names.map((name) => toLibrary(game, name, B));
  library.length = 0;
  library.push(...cards);
  return cards;
};

describe("Tibalt's Trickery", () => {
  it("counters the spell, mills 1 to 3, and its controller may cast what's turned up, free", () => {
    const { game, b } = table();
    const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Hill Giant", "Forest"]);
    const giant = library[3];
    const seen = takesFreeCast(b);
    const before = graveyard(game, B).length;
    trickery(game, spell);
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
    expect(seen.offered).toBe(giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(B);
    // The spell, and one to three milled.
    const milled = graveyard(game, B).length - before - 1;
    expect([1, 2, 3]).toContain(milled);
  });

  it("the random number moves with the seed, and is one of 1, 2 or 3", () => {
    const seen = new Set<number>();
    for (let seed = 1; seed <= 12; seed++) {
      const { game } = table({ seed });
      const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
      stackLibrary(game, ["Forest", "Forest", "Forest", "Forest", "Forest"]);
      const before = graveyard(game, B).length;
      trickery(game, spell);
      settle(game);
      seen.add(graveyard(game, B).length - before - 1);
    }
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("skips a nonland card with that spell's name", () => {
    const { game, b } = table();
    const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Grizzly Bears", "Hill Giant"]);
    const seen = takesFreeCast(b);
    trickery(game, spell);
    settle(game);
    expect(seen.offered).toBe(library[4]);
    expect(zone(game, library[3])).toBe("library");
  });

  it("puts the rest on the bottom in a random order, the card too if it isn't cast", () => {
    const { game } = table();
    const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Forest", "Hill Giant", "Mountain"]);
    trickery(game, spell);
    settle(game);
    // Declined (the seat's default): the giant is back in the library, below the Mountain.
    const after = game.state.zones.perPlayer[B].library;
    expect(after[0]).toBe(library[5]);
    expect(after).toContain(library[4]);
    expect(game.state.zones.shared.exile).not.toContain(library[4]);
  });

  it("exiles the whole library and puts it back when nothing qualifies (the ruling)", () => {
    const { game, b } = table();
    const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
    stackLibrary(game, ["Forest", "Forest", "Forest", "Forest", "Grizzly Bears", "Mountain"]);
    const seen = takesFreeCast(b);
    trickery(game, spell);
    settle(game);
    expect(seen.offered).toBeNull();
    const after = game.state.zones.perPlayer[B].library.length;
    expect(after).toBeGreaterThanOrEqual(3);
    expect(after).toBeLessThanOrEqual(5);
  });

  it("does the rest to a spell that can't be countered, which still resolves (the ruling)", () => {
    const { game, b } = table();
    const spell = bobCasts(game, "Carnage Tyrant", "Forest", 6);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Hill Giant"]);
    const seen = takesFreeCast(b);
    trickery(game, spell);
    settle(game);
    expect(seen.offered).toBe(library[3]);
    expect(zone(game, spell)).toBe("battlefield");
    expect(zone(game, library[3])).toBe("battlefield");
  });

  it("its controller, not its caster's opponent or Trickery's controller, casts it", () => {
    const { game, a, b } = table();
    const spell = bobCasts(game, "Grizzly Bears", "Forest", 2);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Hill Giant"]);
    const alice = takesFreeCast(a);
    const bob = takesFreeCast(b);
    trickery(game, spell, A);
    settle(game);
    expect(alice.offered).toBeNull();
    expect(bob.offered).toBe(library[3]);
    expect(game.state.objects[library[3]].controller).toBe(B);
  });

  it("names a modal double-faced card's back face as it was cast, not as it lies in the graveyard", () => {
    const { game, b } = table();
    nextTurn(game);
    lands(game, "Plains", 2, B);
    const card = toHand(game, "Halvar, God of Battle", B);
    cast(game, card, { player: B, face: 1, settle: false });
    expect(game.state.zones.shared.stack).toContain(card);
    const library = stackLibrary(game, ["Forest", "Forest", "Forest", "Halvar, God of Battle"]);
    const seen = takesFreeCast(b);
    trickery(game, card);
    settle(game);
    // Sword of the Realms was countered: Halvar has a different name.
    expect(seen.offered).toBe(library[3]);
  });
});
