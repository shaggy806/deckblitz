/**
 * March of the Machine: The Aftermath (MAT), batch 1, part b (2026-10-17).
 * Written on the shared table in `harness.ts`, from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";
import { viewFor } from "../view.js";

import {
  A,
  attack,
  counters,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Ayara's Oathsworn", () => {
  it("with three counters, combat damage to a player puts the fourth on and tutors a card", () => {
    const { game, a } = table();
    const oath = spawn(game, "Ayara's Oathsworn");
    game.state.objects[oath].counters["+1/+1"] = 3;
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    attack(game, a, [oath]);
    expect(counters(game, oath)).toBe(4);
    expect(seen.offered).toContain(bears);
    expect(hand(game)).toContain(bears);
  });

  it("with fewer than three, it only grows: no search", () => {
    const { game, a } = table();
    const oath = spawn(game, "Ayara's Oathsworn");
    game.state.objects[oath].counters["+1/+1"] = 1;
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    attack(game, a, [oath]);
    expect(counters(game, oath)).toBe(2);
    expect(seen.offered).toHaveLength(0);
    expect(zone(game, bears)).toBe("library");
  });

  it("with four already, it doesn't trigger: no counter, no search", () => {
    const { game, a } = table();
    const oath = spawn(game, "Ayara's Oathsworn");
    game.state.objects[oath].counters["+1/+1"] = 4;
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    attack(game, a, [oath]);
    expect(counters(game, oath)).toBe(4);
    expect(seen.offered).toHaveLength(0);
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Vesuvan Drifter", () => {
  it("revealing a creature card at the beginning of combat makes it a copy of that card with flying until end of turn", () => {
    const { game, a } = table();
    const drifter = spawn(game, "Vesuvan Drifter");
    toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(nameOf(game.state.objects[drifter])).toBe("Hill Giant");
    expect(pt(game, drifter)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, drifter).has("flying")).toBe(true);
    // A copy of Hill Giant hasn't the Drifter's own abilities: no look at the top any more.
    expect(viewFor(game.state, game.registry, A).revealedLibraryTop[A]).toBeNull();
    game.advanceUntil((s) => s.turn.number === 2);
    expect(nameOf(game.state.objects[drifter])).toBe("Vesuvan Drifter");
    expect(pt(game, drifter)).toEqual({ power: 2, toughness: 4 });
  });

  it("a noncreature card, or declining to reveal, changes nothing; its controller sees the top card", () => {
    const { game, a } = table();
    const drifter = spawn(game, "Vesuvan Drifter");
    const top = game.state.zones.perPlayer[A].library[0];
    expect(viewFor(game.state, game.registry, A).revealedLibraryTop[A]).toBe(top);
    expect(viewFor(game.state, game.registry, "bob" as PlayerId).revealedLibraryTop[A]).toBeNull();
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(nameOf(game.state.objects[drifter])).toBe("Vesuvan Drifter");

    const second = table();
    const other = spawn(second.game, "Vesuvan Drifter");
    toLibrary(second.game, "Hill Giant");
    pickModes(second.a);
    toStep(second.game, "begin-combat");
    settle(second.game);
    expect(nameOf(second.game.state.objects[other])).toBe("Vesuvan Drifter");
  });
});

describe("Nashi, Moon's Legacy", () => {
  it("targets only legendary or Rat cards in your graveyard", () => {
    const { game, a } = table();
    const nashi = spawn(game, "Nashi, Moon's Legacy");
    const legend = toGraveyard(game, "Isamaru, Hound of Konda");
    const rat = toGraveyard(game, "Typhoid Rats");
    const plain = toGraveyard(game, "Grizzly Bears");
    let options: readonly (ObjectId | PlayerId)[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      options = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [null];
    };
    attack(game, a, [nashi]);
    expect(options).toContain(legend);
    expect(options).toContain(rat);
    expect(options).not.toContain(plain);
  });

  it("exiles the card and you may cast a copy of it, paying its cost: it becomes a token", () => {
    const { game, a } = table();
    const nashi = spawn(game, "Nashi, Moon's Legacy");
    const rat = toGraveyard(game, "Typhoid Rats");
    lands(game, "Swamp", 1);
    pickTargets(a, rat);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    attack(game, a, [nashi]);
    expect(zone(game, rat)).toBe("exile");
    const copies = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Typhoid Rats" && game.state.objects[id].isToken,
    );
    expect(copies).toHaveLength(1);
  });
});

describe("Kolaghan Warmonger", () => {
  it("attacking looks at the top six and may take a Dragon among them", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Kolaghan Warmonger");
    const deep = toLibrary(game, "Shivan Dragon");
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Grizzly Bears");
    const near = toLibrary(game, "Shivan Dragon");
    const seen = pickFromZone(a, near);
    attack(game, a, [ogre]);
    expect(seen.offered).toEqual([near]);
    expect(hand(game)).toContain(near);
    expect(zone(game, deep)).toBe("library");
  });
});
