// B272: the cards flagged "Build ASAP" in the library — Dragonhawk, Fate's
// Tempest's "for each of those cards that are still exiled" (the
// `objectTargets` amount, read by a delayed trigger `about: "exiled"`),
// Improvisation Capstone's and Tasha's Hideous Laughter's "until … total mana
// value N or greater" (`reveal-until-count`'s `measure: "mana-value"`), Gonti, Night
// Minister's "a spell they don't own" (`notOwnedByController`), and Animist's
// Awakening (no engine change).

import { describe, expect, it } from "vitest";
import {
  A,
  attack,
  B,
  C,
  cast,
  enter,
  lands,
  life,
  nextTurn,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  toGraveyard,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

describe("Dragonhawk, Fate's Tempest", () => {
  it("exiles X, and at the end step deals 2 per card still exiled, not the ones played", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm"); // a 6/4: with Dragonhawk, X = 2
    const bears = toLibrary(game, "Grizzly Bears");
    enter(game, "Dragonhawk, Fate's Tempest");
    expect(zone(game, bears)).toBe("exile");
    // Two exiled; one played.
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

/** Puts `names` on top of `player`'s library, first name on top. */
function stacked(game: Game, names: readonly string[], player: PlayerId = A): ObjectId[] {
  const ids = names.map((name) => toLibrary(game, name, player));
  const library = game.state.zones.perPlayer[player].library;
  game.state.zones.perPlayer[player].library = [...ids, ...library.filter((id) => !ids.includes(id))];
  return ids;
}

describe("Improvisation Capstone", () => {
  it("exiles until the total mana value reaches 4, then casts spells from among them free", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const [bears, forest, giant, next] = stacked(game, ["Grizzly Bears", "Forest", "Hill Giant", "Grizzly Bears"]);
    const offered: string[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push([...new Set(offer.casts.map((c) => c.cardName))].sort());
      const way = offer.casts[0];
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
    };
    cast(game, toHand(game, "Improvisation Capstone"));
    // 2 + 0 + 4: it stopped at Hill Giant, the next card still on top.
    expect(zone(game, next)).toBe("library");
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(offered[0]).toEqual(["Grizzly Bears", "Hill Giant"]);
  });
});

describe("Tasha's Hideous Laughter", () => {
  it("each opponent exiles until their exiled cards total mana value 20", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 3);
    // Five Hill Giants (4 each) on B's library: exactly 20 after the fifth.
    const giants = stacked(game, Array<string>(6).fill("Hill Giant"), B);
    cast(game, toHand(game, "Tasha's Hideous Laughter"));
    expect(giants.map((id) => zone(game, id))).toEqual([...Array<string>(5).fill("exile"), "library"]);
    // C's library is all Wastes (mana value 0): every card goes.
    expect(game.state.zones.perPlayer[C].library.length).toBe(0);
    expect(game.state.zones.perPlayer[A].library.length).toBeGreaterThan(0);
  });
});

describe("Gonti, Night Minister", () => {
  it("lets another player's creature's controller exile and play the damaged opponent's card, and gives them a Treasure for it", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Gonti, Night Minister");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2, B);
    const top = toLibrary(game, "Grizzly Bears", C);
    nextTurn(game);
    attack(game, b, [bears], C);
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].exiledFaceDown?.lookers).toEqual([B]);
    // B casts C's card with blue mana (mana of any type): a spell B doesn't own.
    cast(game, top, { player: B, via: "impulse" });
    expect(zone(game, top)).toBe("battlefield");
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("doesn't trigger on damage to Gonti's controller, or on a spell its caster owns", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Gonti, Night Minister");
    const bears = spawn(game, "Grizzly Bears", B);
    const top = toLibrary(game, "Grizzly Bears", A);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(zone(game, top)).toBe("library");
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });
});

describe("Animist's Awakening", () => {
  const setUp = (mastery: boolean): { game: Game; found: ObjectId[]; bears: ObjectId; under: ObjectId } => {
    const { game } = table();
    lands(game, "Forest", 4);
    if (mastery) {
      toGraveyard(game, "Divination");
      toGraveyard(game, "Shock");
    }
    const [forest, bears, island, under] = stacked(game, ["Forest", "Grizzly Bears", "Island", "Swamp"]);
    cast(game, toHand(game, "Animist's Awakening"), { x: 3 });
    return { game, found: [forest, island], bears, under };
  };

  it("puts every land among the top X onto the battlefield tapped, the rest on the bottom", () => {
    const { game, found, bears, under } = setUp(false);
    expect(found.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    expect(found.map((id) => game.state.objects[id].tapped)).toEqual([true, true]);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bears);
    expect(zone(game, under)).toBe("library");
    expect(library[0]).toBe(under);
  });

  it("with spell mastery, untaps those lands", () => {
    const { game, found } = setUp(true);
    expect(found.map((id) => game.state.objects[id].tapped)).toEqual([false, false]);
  });
});
