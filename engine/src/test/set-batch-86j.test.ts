/**
 * Set walk batch 86, part j (2026-10-15): cards blocked on expend, freerunning, forage and valiant, authored now they're built.
 * Written on the shared table in `harness.ts`. Every card here is a Bloomburrow Mouse with valiant:
 * the first time each turn its controller targets it, its trigger resolves before the spell that
 * targeted it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const libraryOf = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Emberheart Challenger", () => {
  it("valiant exiles the top card, playable this turn; prowess pumps it too", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const mouse = spawn(game, "Emberheart Challenger");
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(zone(game, bears)).toBe("exile");
    // 2/2, +3/+3 from Brute Force, +1/+1 from prowess.
    expect(pt(game, mouse)).toEqual({ power: 6, toughness: 6 });
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("only the first time it's targeted each turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mouse = spawn(game, "Emberheart Challenger");
    const second = toLibrary(game, "Hill Giant");
    const first = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("library");
  });
});

describe("Flowerfoot Swordmaster", () => {
  it("offspring makes a 1/1 copy; valiant pumps the Mice you control as it resolves, no others", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Flowerfoot Swordmaster");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], kicked: true });
    settle(game);
    const both = named(game, "Flowerfoot Swordmaster");
    expect(both).toHaveLength(2);
    const token = both.find((id) => game.state.objects[id].isToken)!;
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
    cast(game, toHand(game, "Brute Force"), { targets: [ref(card)] });
    expect(pt(game, card)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    // A Mouse that arrives later this turn isn't affected (the ruling).
    const late = spawn(game, "Heartfire Hero");
    expect(pt(game, late)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Mouse Trapper", () => {
  it("valiant taps a creature an opponent controls", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mouse = spawn(game, "Mouse Trapper");
    expect(keywords(game, mouse).has("flash")).toBe(true);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Nettle Guard", () => {
  it("valiant's +0/+2 resolves first, so it survives your own Shock", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const guard = spawn(game, "Nettle Guard");
    cast(game, toHand(game, "Shock"), { targets: [ref(guard)] });
    expect(zone(game, guard)).toBe("battlefield");
    expect(pt(game, guard)).toEqual({ power: 3, toughness: 3 });
  });

  it("{1}, sacrifice it: destroy target artifact or enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const ring = spawn(game, "Sol Ring", B);
    const guard = spawn(game, "Nettle Guard");
    activate(game, guard, 0, { targets: [ref(ring)] });
    expect(zone(game, guard)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Seedglaive Mentor", () => {
  it("a +1/+1 counter the first time you target it each turn, not the second", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mouse = spawn(game, "Seedglaive Mentor");
    expect(keywords(game, mouse).has("vigilance")).toBe(true);
    expect(keywords(game, mouse).has("haste")).toBe(true);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(counters(game, mouse)).toBe(1);
  });
});

describe("Veteran Guardmouse", () => {
  it("valiant: +1/+0 and first strike until end of turn, then scry 1", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Veteran Guardmouse");
    const giant = toLibrary(game, "Hill Giant");
    let scried: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      scried = cards;
      return cards;
    };
    cast(game, toHand(game, "Shock"), { targets: [ref(mouse)] });
    expect(pt(game, mouse)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mouse).has("first-strike")).toBe(true);
    expect(scried).toEqual([giant]);
    expect(libraryOf(game).at(-1)).toBe(giant);
    nextTurn(game);
    expect(pt(game, mouse)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, mouse).has("first-strike")).toBe(false);
  });
});

describe("Whiskerquill Scribe", () => {
  it("valiant: you may discard a card, and if you do, draw one", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Whiskerquill Scribe");
    const force = toHand(game, "Brute Force");
    const start = hand(game).length;
    const top = toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    cast(game, force, { targets: [ref(mouse)] });
    expect(hand(game)).toHaveLength(start - 1);
    expect(zone(game, top)).toBe("hand");
    expect(graveyard(game)).toHaveLength(2); // the discarded card and Brute Force
  });

  it("declined, nothing is discarded or drawn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Whiskerquill Scribe");
    const force = toHand(game, "Brute Force");
    const start = hand(game).length;
    const top = toLibrary(game, "Hill Giant");
    cast(game, force, { targets: [ref(mouse)] });
    expect(hand(game)).toHaveLength(start - 1);
    expect(zone(game, top)).toBe("library");
    expect(graveyard(game)).toEqual([force]);
  });
});

describe("Whiskervale Forerunner", () => {
  /** Hill Giant (mana value 4) under Grizzly Bears (2) on top of alice's library. */
  function stack(game: Game): { bears: ObjectId; giant: ObjectId } {
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    return { bears, giant };
  }

  it("on your turn, the creature with mana value 3 or less may go onto the battlefield; the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Whiskervale Forerunner");
    const { bears, giant } = stack(game);
    const offered: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(eligible);
      return eligible;
    };
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(offered[0]).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(libraryOf(game).slice(-4)).toContain(giant);
  });

  it("on your turn, if you don't put it onto the battlefield, it goes into your hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Whiskervale Forerunner");
    const { bears } = stack(game);
    let call = 0;
    a.chooseFromZoneFn = (_view, eligible) => (call++ === 0 ? [] : eligible);
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(zone(game, bears)).toBe("hand");
  });

  it("on an opponent's turn, it can only go into your hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mouse = spawn(game, "Whiskervale Forerunner");
    nextTurn(game); // bob's turn
    const { bears } = stack(game);
    let calls = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      calls++;
      return eligible;
    };
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Brute Force"), { targets: [ref(mouse)] });
    expect(calls).toBe(1);
    expect(zone(game, bears)).toBe("hand");
  });
});
