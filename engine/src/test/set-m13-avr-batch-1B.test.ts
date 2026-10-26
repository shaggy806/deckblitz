/**
 * Magic 2013 and Avacyn Restored (M13, AVR; B182), group B. One test per
 * card whose behaviour is more than a stat line or a copy of a tested
 * pattern, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  blockOffer,
  type BlockOffer,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";

/** Who may attack, as the attack is declared. */
const eligibleAttackers = (game: Game): readonly ObjectId[] => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
  return offer?.kind === "declare-attackers" ? offer.eligible : [];
};

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Sublime Archangel", () => {
  it("gives each other creature exalted: a lone attacker gets +1/+1 per instance", () => {
    const { game, a } = table();
    spawn(game, "Sublime Archangel");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    attack(game, a, [bears]);
    // Three instances: the Archangel's own and the two Bears' granted ones.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });
});

describe("Slumbering Dragon", () => {
  it("can't attack with four +1/+1 counters, can with five", () => {
    for (const [n, can] of [
      [4, false],
      [5, true],
    ] as const) {
      const { game } = table();
      const dragon = spawn(game, "Slumbering Dragon");
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: n }, [ref(dragon)]);
      settle(game);
      expect(counters(game, dragon)).toBe(n);
      expect(eligibleAttackers(game).includes(dragon)).toBe(can);
    }
  });

  it("gets a counter for each creature that attacks its controller", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Slumbering Dragon", B);
    const bears = spawn(game, "Grizzly Bears");
    const bears2 = spawn(game, "Grizzly Bears");
    // Alice attacks Bob with two creatures: two triggers.
    attack(game, a, [bears, bears2]);
    expect(counters(game, dragon)).toBe(2);
  });
});

describe("War Falcon", () => {
  it("can't attack unless you control a Knight or a Soldier", () => {
    const { game } = table();
    const falcon = spawn(game, "War Falcon");
    expect(eligibleAttackers(game)).not.toContain(falcon);
  });

  it("can attack with a Soldier beside it", () => {
    const { game } = table();
    const falcon = spawn(game, "War Falcon");
    spawn(game, "Akrasan Squire");
    expect(eligibleAttackers(game)).toContain(falcon);
  });
});

describe("Bower Passage", () => {
  it("stops fliers blocking your creatures, but not reach", () => {
    const { game, a } = table();
    spawn(game, "Bower Passage");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const spider = spawn(game, "Giant Spider", B);
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, angel)).toEqual([]);
    expect(canBlock(offer, spider)).toEqual([bears]);
  });
});

describe("Arcane Melee", () => {
  it("makes an instant or sorcery cost {2} less, generic only", () => {
    const { game } = table();
    spawn(game, "Arcane Melee");
    lands(game, "Island", 1);
    const card = toHand(game, "Divination");
    cast(game, card);
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Call to Serve", () => {
  it("makes the creature a 3/4 flying Angel, and falls off once it turns black", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toHand(game, "Call to Serve");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(subtypes(game, bears)).toContain("Angel");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Deathlace"), { targets: [ref(bears)] });
    expect(graveyard(game)).toContain(aura);
  });
});

describe("Goldnight Redeemer", () => {
  it("gains 2 life for each other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    enter(game, "Goldnight Redeemer");
    expect(life(game)).toBe(24);
  });
});

describe("Dreadwaters", () => {
  it("mills the target player one card per land you control", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const before = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Dreadwaters"), { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 6);
    expect(graveyard(game, B).length).toBe(6);
  });
});
