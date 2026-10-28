/**
 * Recheck list R7, group E: the cards whose narrow blocker turned out to be
 * built — Gandalf, Friend of the Shire; Glorious Gale; Ancient Bronze Dragon.
 */
import { describe, expect, it } from "vitest";

import { ringBearerOf } from "../ring.js";

import {
  A,
  attack,
  cast,
  counters,
  hand,
  lands,
  pickPermanents,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Gandalf, Friend of the Shire", () => {
  it("draws when another creature is chosen as Ring-bearer, not when Gandalf is", () => {
    const { game, a } = table();
    const gandalf = spawn(game, "Gandalf, Friend of the Shire");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");

    // Birthday Escape: "Draw a card. The Ring tempts you." — bears chosen.
    pickPermanents(a, bears);
    const before = hand(game).length;
    cast(game, toHand(game, "Birthday Escape"));
    expect(ringBearerOf(game.state, A)).toBe(bears);
    // +1 Escape's draw, +1 Gandalf's (the Escape itself left hand: drew 2, cast 1 we added).
    expect(hand(game).length).toBe(before + 2);

    // Gandalf chosen: no draw from Gandalf.
    pickPermanents(a, gandalf);
    const before2 = hand(game).length;
    cast(game, toHand(game, "Birthday Escape"));
    expect(ringBearerOf(game.state, A)).toBe(gandalf);
    expect(hand(game).length).toBe(before2 + 1);
  });

  it("lets its controller cast a sorcery at instant speed", () => {
    const { game } = table();
    spawn(game, "Gandalf, Friend of the Shire");
    lands(game, "Island", 1);
    toLibrary(game, "Wastes");
    toStep(game, "end");
    const escape = toHand(game, "Birthday Escape");
    cast(game, escape);
    expect(zone(game, escape)).toBe("graveyard");
  });
});

describe("Glorious Gale", () => {
  it("counters a legendary creature spell and the Ring tempts you", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    lands(game, "Island", 6);
    // Countered by its own caster, holding priority.
    const spell = toHand(game, "Gandalf, Friend of the Shire");
    cast(game, spell, { settle: false });
    cast(game, toHand(game, "Glorious Gale"), { targets: [ref(spell)] });
    expect(zone(game, spell)).toBe("graveyard");
    expect(game.state.players[A].ringTemptations).toBe(1);
    expect(ringBearerOf(game.state, A)).toBe(bears);
  });

  it("counters a nonlegendary creature spell without tempting", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const spell = toHand(game, "Grizzly Bears");
    cast(game, spell, { settle: false });
    cast(game, toHand(game, "Glorious Gale"), { targets: [ref(spell)] });
    expect(zone(game, spell)).toBe("graveyard");
    expect(game.state.players[A].ringTemptations ?? 0).toBe(0);
  });
});

describe("Ancient Bronze Dragon", () => {
  it("puts X counters on each of two targets, X the d20 result", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Ancient Bronze Dragon");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, dragon, bears);
    attack(game, a, [dragon]);
    const total = game.state.lastRoll!.total;
    expect(total).toBeGreaterThanOrEqual(1);
    expect(counters(game, dragon)).toBe(total);
    expect(counters(game, bears)).toBe(total);
  });

  it("may target just one creature", () => {
    const { game, a } = table({ seed: 3 });
    const dragon = spawn(game, "Ancient Bronze Dragon");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears, null);
    attack(game, a, [dragon]);
    expect(counters(game, bears)).toBe(game.state.lastRoll!.total);
    expect(counters(game, dragon)).toBe(0);
  });
});
