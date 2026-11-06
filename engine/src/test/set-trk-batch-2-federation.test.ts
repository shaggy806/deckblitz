/**
 * Star Trek (TRK), batch 267's lead cards: Federation's "the number of
 * creature types among non-Borg creatures you control" — an `aggregate:
 * "distinct"` over `{ subtypesOf: "creature" }`. That count once asked
 * `hasSubtype(…, EVERY_CREATURE_TYPE)`, which is true for any creature with a
 * creature type, so every creature counted as a changeling (~350 types): these
 * tests pin the real count. A changeling is every creature type (rule 702.73a),
 * Borg among them, so "non-Borg" leaves it out.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  B,
  activate,
  blockOffer,
  cast,
  enter,
  hand,
  lands,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Captain Jonathan Archer", () => {
  it("makes Porthos, and pumps by the creature types among non-Borg creatures you control", () => {
    const { game } = table();
    const archer = enter(game, "Captain Jonathan Archer"); // Human Officer
    expect(tokensNamed(game, "Porthos")).toBe(1); // Dog
    const bears = spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Llanowar Elves"); // Elf Druid
    spawn(game, "Changeling Outcast"); // every type, Borg too: left out
    spawn(game, "Grizzly Bears", B); // not yours
    lands(game, "Forest", 1);
    toStep(game, "precombat-main");
    activate(game, archer, 0, { targets: [ref(bears)] });
    // Human, Officer, Dog, Bear, Elf, Druid.
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Saavik, Stoic Student", () => {
  it("deals X damage to a blocking creature an opponent controls", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears"); // Bear
    const giant = spawn(game, "Hill Giant", B); // 3/3
    lands(game, "Plains", 5);
    blockOffer(game, a, [bears]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: giant, attacker: bears }] });
    pickTargets(a, giant);
    cast(game, toHand(game, "Saavik, Stoic Student"));
    // Bear, Vulcan, Advisor: 3 damage kills the 3/3.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can't target a creature that isn't attacking or blocking", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant", B);
    lands(game, "Plains", 5);
    const seen = watchTargets(a);
    cast(game, toHand(game, "Saavik, Stoic Student"));
    // No legal target: the trigger is removed without asking (rule 603.3d).
    expect(seen.offered.flat()).toEqual([]);
  });
});

describe("Hoshi Sato, Exolinguist", () => {
  it("looks at as many cards as there are creature types among your non-Borg creatures", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Wastes");
    spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Command Subadjunct"); // a Borg: left out
    lands(game, "Island", 5);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [eligible[0]];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Hoshi Sato, Exolinguist"));
    // Bear, Human, Scientist.
    expect(offered).toHaveLength(3);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Infinite Diversity", () => {
  it("casts the exiled card's copies X times", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Llanowar Elves"); // Elf Druid
    lands(game, "Mountain", 9);
    const divination = toGraveyard(game, "Divination");
    for (let i = 0; i < 10; i += 1) toLibrary(game, "Wastes");
    const casts: ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      if (offer.casts.length === 0) return null;
      const way = offer.casts[0];
      casts.push(way.card);
      return { type: "cast-spell", player: a.playerId, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const spell = toHand(game, "Infinite Diversity");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(divination)] });
    // Bear, Elf, Druid: three copies, two cards each.
    expect(casts).toHaveLength(3);
    expect(hand(game).length).toBe(before - 1 + 6);
    expect(zone(game, divination)).toBe("exile");
    expect(zone(game, spell)).toBe("exile");
  });
});
