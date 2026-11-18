/**
 * A card's object id, and the art manifest, must not say which hidden card is
 * which (the 2026-11-18 review). Every viewer is sent the ids in every hand,
 * so ids that ran in deck-list order, beside a manifest in that same order,
 * named the cards in it.
 */
import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { asPlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

// No name twice in either list, so a card is found by its name.
const LIST_A = [
  "Forest",
  "Grizzly Bears",
  "Llanowar Elves",
  "Giant Growth",
  "Naturalize",
  "Rampant Growth",
  "Cultivate",
  "Elvish Mystic",
  "Hill Giant",
  "Lightning Bolt",
  "Shock",
  "Mountain",
  "Sol Ring",
  "Arcane Signet",
  "Command Tower",
  "Fireball",
  "Kodama's Reach",
  "Reclamation Sage",
  "Beast Within",
  "Harmonize",
];
const LIST_B = [
  "Island",
  "Counterspell",
  "Divination",
  "Opt",
  "Cancel",
  "Swamp",
  "Murder",
  "Dark Ritual",
  "Plains",
  "Serra Angel",
  "Swords to Plowshares",
  "Wrath of God",
  "Brainstorm",
  "Ponder",
  "Preordain",
  "Doom Blade",
  "Go for the Throat",
  "Sign in Blood",
  "Night's Whisper",
  "Path to Exile",
];

const newGame = (seed: number, idSalt?: string, a: string[] = LIST_A, b: string[] = LIST_B): Game =>
  Game.create({
    seed,
    ...(idSalt !== undefined ? { idSalt } : {}),
    decks: [
      { player: A, cards: a },
      { player: B, cards: b },
    ],
  });

/** Each list card's id number, in list order. */
function numbersInListOrder(game: Game, player: PlayerId, list: readonly string[]): number[] {
  return list.map((name) => {
    const object = Object.values(game.state.objects).find((o) => o.owner === player && o.cardName === name);
    if (object === undefined) throw new Error(`no ${name} of ${player}'s`);
    return Number(object.id.slice("obj-".length));
  });
}

/** A zone's cards by name, in the zone's order. */
function names(game: Game, ids: readonly ObjectId[]): string[] {
  return ids.map((id) => game.state.objects[id].cardName);
}

const ascending = (numbers: readonly number[]): number[] => [...numbers].sort((x, y) => x - y);

describe("object ids and the art manifest keep hidden cards hidden", () => {
  it("a deck's ids are its own run of numbers, in an order that isn't the list's", () => {
    const game = newGame(7);
    for (const [player, list] of [
      [A, LIST_A],
      [B, LIST_B],
    ] as const) {
      const numbers = numbersInListOrder(game, player, list);
      const sorted = ascending(numbers);
      // One unbroken run, as before...
      expect(sorted).toEqual(sorted.map((_, index) => sorted[0] + index));
      // ...but no longer handed out down the list.
      expect(numbers).not.toEqual(sorted);
    }
  });

  it("one deck's order says nothing about another's", () => {
    const game = newGame(7);
    const offsets = (numbers: number[]): number[] => numbers.map((n) => n - Math.min(...numbers));
    expect(offsets(numbersInListOrder(game, A, LIST_A))).not.toEqual(offsets(numbersInListOrder(game, B, LIST_B)));
  });

  it("the salt alone picks the ids: another salt, other ids; the same salt, the same ids", () => {
    const first = numbersInListOrder(newGame(7, "one"), A, LIST_A);
    expect(numbersInListOrder(newGame(7, "one"), A, LIST_A)).toEqual(first);
    expect(numbersInListOrder(newGame(7, "two"), A, LIST_A)).not.toEqual(first);
    // With no salt it comes from the seed, so a seeded game replays id for id.
    expect(numbersInListOrder(newGame(7), A, LIST_A)).toEqual(numbersInListOrder(newGame(7), A, LIST_A));
    expect(numbersInListOrder(newGame(8), A, LIST_A)).not.toEqual(numbersInListOrder(newGame(7), A, LIST_A));
  });

  it("the salt changes no shuffle: a seed deals the same cards to the same places", () => {
    const one = newGame(7, "one");
    const two = newGame(7, "two");
    for (const player of [A, B]) {
      const zonesOne = one.state.zones.perPlayer[player];
      const zonesTwo = two.state.zones.perPlayer[player];
      expect(names(one, zonesOne.hand)).toEqual(names(two, zonesTwo.hand));
      expect(names(one, zonesOne.library)).toEqual(names(two, zonesTwo.library));
      expect(zonesOne.hand.length).toBeGreaterThan(0);
    }
  });

  it("the art manifest is in name order, whatever order the lists came in", () => {
    const manifest = newGame(7).artManifest();
    const listed = manifest.map((entry) => entry.name);
    expect(listed).toEqual([...listed].sort());
    expect(listed).toHaveLength(LIST_A.length + LIST_B.length);
    const reversed = newGame(7, undefined, [...LIST_A].reverse(), [...LIST_B].reverse()).artManifest();
    expect(reversed).toEqual(manifest);
  });
});
