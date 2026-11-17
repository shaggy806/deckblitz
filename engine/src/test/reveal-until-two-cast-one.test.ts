/**
 * Invasion of Alara // Awaken the Maelstrom.
 *
 * The front: "exile cards from the top of your library until you exile two
 * nonland cards with mana value 4 or less. You may cast one of those two
 * cards without paying its mana cost. Put one of them into your hand. Then
 * put the other cards exiled this way on the bottom of your library in a
 * random order" — a `reveal-until-count` that leaves everything in exile,
 * `cast-now`'s `filter` (the found cards as cards, not the face a spell would
 * be), a `look-and-choose` into the hand, and `move-exiled-this-way` of the
 * cards that didn't match. With none cast, the one not put into the hand
 * stays exiled (the ruling).
 *
 * The back: two targets, every other choice made as it resolves (rule
 * 608.2d), the counters among one to three creatures (`counters-distributed`
 * with `atLeastOne`).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import {
  A,
  B,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickFromZone,
  ref,
  spawn,
  table,
  tokensNamed,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** Stack the library: the first name ends up on top. */
function stack(game: Game, ...names: readonly string[]): ObjectId[] {
  const ids = [...names].reverse().map((name) => toLibrary(game, name));
  return ids.reverse();
}

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("Invasion of Alara", () => {
  it("casts one of the two found free, puts the other into the hand, and the rest go to the bottom", () => {
    const { game, a } = table();
    const [mountain, shivan, bolt, divination] = stack(game, "Mountain", "Shivan Dragon", "Lightning Bolt", "Divination");
    const offered: string[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(offer.cards.map((id) => nameOf(game.state.objects[id])).sort());
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    pickFromZone(a, divination);
    enter(game, "Invasion of Alara");
    expect(offered).toEqual([["Divination", "Lightning Bolt"]]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game)).toContain(divination);
    // The two that didn't match, under the library's Wastes.
    expect(zone(game, mountain)).toBe("library");
    expect(zone(game, shivan)).toBe("library");
    expect(library(game).slice(-2).sort()).toEqual([mountain, shivan].sort());
    expect(game.state.zones.shared.exile).toEqual([]);
  });

  it("with none cast, the one put into the hand is chosen and the other stays in exile", () => {
    const { game, a } = table();
    const [mountain, shivan, bolt, divination] = stack(game, "Mountain", "Shivan Dragon", "Lightning Bolt", "Divination");
    const seen = pickFromZone(a, bolt);
    enter(game, "Invasion of Alara");
    expect([...seen.offered].sort()).toEqual([bolt, divination].sort());
    expect(hand(game)).toContain(bolt);
    expect(zone(game, divination)).toBe("exile");
    expect(game.state.zones.shared.exile).toEqual([divination]);
    expect(library(game).slice(-2).sort()).toEqual([mountain, shivan].sort());
  });

  it("a card exiled on the way whose cheaper face would pass as the spell isn't offered", () => {
    const { game, a } = table();
    // Beanstalk Giant is mana value 7 as a card; its Adventure, Fertile
    // Footsteps, is a 3-mana sorcery. Expansion // Explosion is 6 as a card.
    const [giant, split, bolt, divination] = stack(
      game,
      "Beanstalk Giant",
      "Expansion // Explosion",
      "Lightning Bolt",
      "Divination",
    );
    const offered: ObjectId[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push([...offer.cards].sort());
      return null;
    };
    pickFromZone(a, divination);
    enter(game, "Invasion of Alara");
    expect(offered).toEqual([[bolt, divination].sort()]);
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, split)).toBe("library");
    expect(zone(game, bolt)).toBe("exile");
  });

  it("with only one found, it may be cast, or else it's put into the hand", () => {
    const { game, a } = table();
    const [bolt] = stack(game, "Lightning Bolt");
    const sizeBefore = library(game).length;
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    enter(game, "Invasion of Alara");
    expect(asked).toBe(1);
    expect(hand(game)).toContain(bolt);
    // Every Wastes was exiled looking for a second, and went back under.
    expect(library(game).length).toBe(sizeBefore - 1);
    expect(game.state.zones.shared.exile).toEqual([]);
  });
});

describe("Awaken the Maelstrom", () => {
  it("draws, puts an artifact in, copies it, distributes the counters and destroys", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const siege = toHand(game, "Invasion of Alara");
    cast(game, siege);
    expect(counters(game, siege, "defense")).toBe(7);
    const ours = spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    spawn(game, "Llanowar Elves");
    spawn(game, "Elite Vanguard");
    const theirs = spawn(game, "Grizzly Bears", B);
    const stone = toHand(game, "Mind Stone");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return {
        type: "cast-spell",
        player: A,
        card: way.card,
        targets: [ref(A), ref(theirs)],
        via: way.via,
        ...(way.face !== undefined ? { face: way.face } : {}),
        ...(offer.free ? { free: true } : {}),
      };
    };
    pickFromZone(a, stone);
    const asked: { min: number; max: number; eligible: readonly ObjectId[] }[] = [];
    a.choosePermanentsFn = (_view, eligible, min, max) => {
      asked.push({ min, max, eligible });
      // First the permanent to copy, then the creatures for the counters.
      return asked.length === 1 ? [stone] : [ours];
    };
    const handBefore = hand(game).length;
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Blaze"), { x: 7, targets: [ref(siege)] });
    // Cast transformed from exile, it resolved into its owner's graveyard.
    expect(zone(game, siege)).toBe("graveyard");
    // Two drawn, the Mind Stone out of the hand (Blaze was spawned and cast).
    expect(hand(game).length).toBe(handBefore + 2 - 1);
    expect(zone(game, stone)).toBe("battlefield");
    expect(tokensNamed(game, "Mind Stone")).toBe(1);
    expect(asked[1].min).toBe(1);
    expect(asked[1].max).toBe(3);
    expect(counters(game, ours)).toBe(3);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
