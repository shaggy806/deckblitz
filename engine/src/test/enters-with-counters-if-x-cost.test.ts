/**
 * Counters a card enters with only if it matches a test as it would exist on
 * the battlefield (an `EnterCounter`'s `ifMatches`, rule 614.12) — The First
 * Tyrannic War's chapter I: "You may put a creature card from your hand onto
 * the battlefield. If its mana cost contains {X}, it enters with a number of
 * +1/+1 counters on it equal to the number of lands you control." A copy's
 * mana cost is the one read (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, cast, counters, lands, pickFromZone, pickTargets, pt, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

type T = ReturnType<typeof table>;

/** Cast the Saga with six lands out (seven with its own five's worth), its
 * chapter I choosing `card` from the hand. */
function castSaga(t: T, card: ObjectId | null): ObjectId {
  const { game, a } = t;
  lands(game, "Forest", 1);
  lands(game, "Island", 1);
  lands(game, "Mountain", 4);
  if (card !== null) pickFromZone(a, card);
  else pickFromZone(a);
  const saga = toHand(game, "The First Tyrannic War");
  cast(game, saga);
  settle(game);
  return saga;
}

describe("The First Tyrannic War", () => {
  it("chapter I: a creature with {X} in its mana cost enters with a counter for each land you control", () => {
    const t = table();
    const one = toHand(t.game, "Endless One");
    castSaga(t, one);
    expect(zone(t.game, one)).toBe("battlefield");
    // Its own "enters with X" is 0 (not cast); the Saga's are six.
    expect(counters(t.game, one)).toBe(6);
  });

  it("chapter I: a creature without {X} enters with none", () => {
    const t = table();
    const bears = toHand(t.game, "Grizzly Bears");
    castSaga(t, bears);
    expect(zone(t.game, bears)).toBe("battlefield");
    expect(counters(t.game, bears)).toBe(0);
  });

  it("chapter I may put nothing onto the battlefield", () => {
    const t = table();
    const bears = toHand(t.game, "Grizzly Bears");
    castSaga(t, null);
    expect(zone(t.game, bears)).toBe("hand");
  });

  it("a Clone entering as a copy of a creature with {X} gets them; as a copy of one without, none", () => {
    const t = table();
    const serpent = spawn(t.game, "Lightning Serpent");
    const clone = toHand(t.game, "Clone");
    t.a.chooseCopyFn = () => serpent;
    castSaga(t, clone);
    expect(zone(t.game, clone)).toBe("battlefield");
    expect(counters(t.game, clone)).toBe(6);
    expect(pt(t.game, clone)).toEqual({ power: 8, toughness: 7 });

    const u = table();
    const bears = spawn(u.game, "Grizzly Bears");
    const other = toHand(u.game, "Clone");
    u.a.chooseCopyFn = () => bears;
    castSaga(u, other);
    expect(zone(u.game, other)).toBe("battlefield");
    expect(counters(u.game, other)).toBe(0);
    expect(pt(u.game, other)).toEqual({ power: 2, toughness: 2 });
  });

  it("chapter II doubles each kind of counter on target creature you control", () => {
    const t = table();
    const one = toHand(t.game, "Endless One");
    castSaga(t, one);
    expect(counters(t.game, one)).toBe(6);
    pickTargets(t.a, one);
    toStep(t.game, "precombat-main", A);
    settle(t.game);
    expect(counters(t.game, one)).toBe(12);
  });
});
