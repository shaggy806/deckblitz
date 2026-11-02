// `CardFilter`'s `doubleFaced` (rule 712.1), and Nick Fury's "you may transform it"
// written with it: put first, then turned over, a single-faced card never asked.
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  counters,
  enter,
  hand,
  lands,
  pickFromZone,
  pickPermanents,
  registryOf,
  spawn,
  table,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

const NICK = "Nick Fury, Agent of S.H.I.E.L.D.";

describe("the doubleFaced clause", () => {
  const matches = (game: Game, id: ObjectId) =>
    matchesFilter(game.state, registryOf(game), id, { doubleFaced: true }, { you: A });

  it("takes all three kinds of rule 712.1, and not a single-faced card", () => {
    const { game } = table();
    expect(matches(game, toHand(game, "Dowsing Dagger"))).toBe(true); // nonmodal
    expect(matches(game, toHand(game, "Agadeem's Awakening"))).toBe(true); // modal
    expect(matches(game, toHand(game, "Graf Rats"))).toBe(true); // meld, the half with no ability
    expect(matches(game, toHand(game, "Midnight Scavengers"))).toBe(true); // meld, the other half
    expect(matches(game, toHand(game, "Hanweir Battlements"))).toBe(true); // meld, a land
    expect(matches(game, toHand(game, "Grizzly Bears"))).toBe(false);
  });

  it("holds in any zone and with either face up", () => {
    const { game, a } = table();
    const dagger = toLibrary(game, "Dowsing Dagger");
    expect(matches(game, dagger)).toBe(true);
    const nick = spawn(game, NICK);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    pickFromZone(a, dagger);
    pickPermanents(a, dagger);
    activate(game, nick);
    expect(types(game, dagger)).toContain("land");
    expect(matches(game, dagger)).toBe(true);
  });
});

describe("Nick Fury, Agent of S.H.I.E.L.D.", () => {
  const setUp = (name: string) => {
    const { game, a } = table();
    const nick = spawn(game, NICK);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const card = toLibrary(game, name);
    return { game, a, nick, card };
  };

  it("puts a double-faced Equipment in, then transforms it when chosen", () => {
    const { game, a, nick, card } = setUp("Dowsing Dagger");
    pickFromZone(a, card);
    const asked = pickPermanents(a, card);
    activate(game, nick);
    expect(counters(game, nick)).toBe(2);
    expect(zone(game, card)).toBe("battlefield");
    expect(asked.offered).toEqual([card]);
    expect(types(game, card)).toContain("land");
  });

  it("keeps the front face when declined", () => {
    const { game, a, nick, card } = setUp("Dowsing Dagger");
    pickFromZone(a, card);
    pickPermanents(a);
    activate(game, nick);
    expect(zone(game, card)).toBe("battlefield");
    expect(types(game, card)).toContain("artifact");
    expect(types(game, card)).not.toContain("land");
  });

  it("never asks about a single-faced card", () => {
    const { game, a, nick, card } = setUp("Bonesplitter");
    pickFromZone(a, card);
    const asked = pickPermanents(a, card);
    activate(game, nick);
    expect(zone(game, card)).toBe("battlefield");
    expect(asked.offered).toEqual([]);
  });

  it("leaves a card it may not take in the library, and a power-up goes only once", () => {
    const { game, a, nick, card } = setUp("Grizzly Bears");
    const seen = pickFromZone(a);
    activate(game, nick);
    expect(zone(game, card)).toBe("library");
    expect(seen.offered).not.toContain(card);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    expect(() => activate(game, nick)).toThrow();
  });
});

describe("Overgrown Pest", () => {
  it("offers a land or a double-faced card, and not a single-faced spell", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest");
    const dfc = toLibrary(game, "Dowsing Dagger");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, dfc);
    enter(game, "Overgrown Pest");
    expect(seen.offered).toContain(land);
    expect(seen.offered).toContain(dfc);
    expect(seen.offered).not.toContain(bears);
    expect(hand(game)).toContain(dfc);
  });
});
