/**
 * Enlist (rule 702.154): "As this creature attacks, you may tap up to one
 * untapped creature you control that you didn't choose to attack with and
 * that either has haste or has been under your control continuously since
 * this turn began. When you do, this creature gets +X/+0 until end of turn,
 * where X is the tapped creature's power." — `StaticAbility.enlist` (the
 * `enlist()` helper), an optional cost to attack (702.154b, 508.1g) asked as
 * a `choose-permanents` of up to one before the attack is announced; the
 * `enlists` trigger (702.154c — Guardian of New Benalia) and the
 * `enlistedThisCombat` filter clause (Aradesh, the Founder). Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { createDefaultRegistry, defineCard } from "../cards.js";
import { enlist } from "../cards/helpers.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, hand, life, pickPermanents, pt, spawn, table, toStep } from "./harness.js";

describe("enlist", () => {
  it("taps a nonattacking creature as the attack is declared, and the attacker gets its power until end of turn", () => {
    const { game, a } = table();
    const brute = spawn(game, "Coalition Warbrute");
    const giant = spawn(game, "Hill Giant");
    const seen = pickPermanents(a, giant);
    attack(game, a, [brute]);
    expect(seen.offered).toEqual([giant]);
    expect(game.state.objects[giant].tapped).toBe(true);
    // 3 + the Giant's 3, trample: all 6 to Bob.
    expect(pt(game, brute)).toEqual({ power: 6, toughness: 4 });
    expect(life(game, B)).toBe(14);
    // Until end of turn.
    toStep(game, "upkeep", B);
    expect(pt(game, brute)).toEqual({ power: 3, toughness: 4 });
  });

  it("offers only an untapped creature that isn't attacking and isn't summoning sick — or has haste — never the attacker", () => {
    const { game, a } = table();
    const brute = spawn(game, "Coalition Warbrute");
    const angel = spawn(game, "Serra Angel");
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    const hasty = spawn(game, "Raging Goblin", A, { sick: true });
    const tapped = spawn(game, "Hill Giant", A, { tapped: true });
    const ready = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a);
    // The Angel attacks too — with vigilance it stays untapped, but it was
    // chosen to attack, so it can't be enlisted.
    attack(game, a, [brute, angel]);
    expect([...seen.offered].sort()).toEqual([hasty, ready].sort());
    expect(seen.offered).not.toContain(fresh);
    expect(seen.offered).not.toContain(tapped);
    expect(seen.offered).not.toContain(brute);
  });

  it("may be declined: nothing taps and the attacker keeps its power", () => {
    const { game, a } = table();
    const brute = spawn(game, "Coalition Warbrute");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    attack(game, a, [brute]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("isn't asked with nothing to enlist", () => {
    const { game, a } = table();
    const brute = spawn(game, "Coalition Warbrute");
    let asked = 0;
    a.choosePermanentsFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [brute]);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(17);
  });

  it("asks each attacker with enlist in turn, and one creature can't be enlisted twice", () => {
    const { game, a } = table();
    const first = spawn(game, "Coalition Warbrute");
    const second = spawn(game, "Coalition Warbrute");
    const giant = spawn(game, "Hill Giant");
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return eligible.slice(0, 1);
    };
    attack(game, a, [first, second]);
    // The first enlists the Giant; the second has nothing left to tap.
    expect(offers).toEqual([[giant]]);
    expect(pt(game, first).power + pt(game, second).power).toBe(9);
    expect(life(game, B)).toBe(11);
  });

  it("is an ability: a creature that has lost its abilities can't enlist", () => {
    const { game, a } = table();
    const brute = spawn(game, "Coalition Warbrute");
    spawn(game, "Grizzly Bears");
    spawn(game, "Humility", B);
    let asked = 0;
    a.choosePermanentsFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [brute]);
    expect(asked).toBe(0);
  });

  it("Guardian of New Benalia: scries 2 whenever it enlists a creature, and not when it doesn't", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Guardian of New Benalia");
    const bears = spawn(game, "Grizzly Bears");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    pickPermanents(a);
    attack(game, a, [guardian]);
    expect(scried).toBe(0);
    toStep(game, "precombat-main", A);
    pickPermanents(a, bears);
    attack(game, a, [guardian]);
    expect(scried).toBe(2);
    expect(life(game, B)).toBe(20 - 2 - 4);
  });

  it("Aradesh, the Founder: an attacker that enlisted gains double strike, and draws a card at power 4 or more", () => {
    const { game, a } = table();
    spawn(game, "Aradesh, the Founder");
    const brute = spawn(game, "Coalition Warbrute");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickPermanents(a, bears);
    attack(game, a, [brute]);
    // Enlisted for 5 power, double strike: 10 trample damage, and a card.
    expect(life(game, B)).toBe(10);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Aradesh, the Founder: an attacker that didn't enlist gets nothing", () => {
    const { game, a } = table();
    spawn(game, "Aradesh, the Founder");
    const brute = spawn(game, "Coalition Warbrute");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickPermanents(a);
    attack(game, a, [brute]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before);
  });

  it("Aradesh, the Founder: double strike without a card under power 4", () => {
    const { game, a } = table();
    const aradesh = spawn(game, "Aradesh, the Founder");
    const goblin = spawn(game, "Raging Goblin");
    const before = hand(game).length;
    pickPermanents(a, goblin);
    attack(game, a, [aradesh]);
    // 1 + the Goblin's 1 = 2, twice.
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before);
  });

  describe("with an attack tax (rules 508.1g-j: chosen before the cost is paid)", () => {
    // Declared by hand: a scripted seat's attack is cut to the tax it could
    // pay with every creature that might attack held back.
    const declare = (game: Game, attacker: ObjectId): void => {
      toStep(game, "declare-attackers", A);
      game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker, defender: B }] });
      toStep(game, "postcombat-main", A);
    };

    it("the tax isn't paid first with the creature meant to be enlisted", () => {
      const { game, a } = table();
      const brute = spawn(game, "Coalition Warbrute");
      spawn(game, "Ghostly Prison", B);
      const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves")];
      const seen = pickPermanents(a, elves[2]);
      declare(game, brute);
      // Every Elf could be the one enlisted, the other two paying {2}.
      expect([...seen.offered].sort()).toEqual([...elves].sort());
      expect(elves.every((id) => game.state.objects[id].tapped)).toBe(true);
      expect(life(game, B)).toBe(20 - 3 - 1);
    });

    it("no creature is offered if tapping it would leave the tax unpayable", () => {
      const { game, a } = table();
      const brute = spawn(game, "Coalition Warbrute");
      spawn(game, "Ghostly Prison", B);
      const elves = [spawn(game, "Llanowar Elves"), spawn(game, "Llanowar Elves")];
      let asked = 0;
      a.choosePermanentsFn = () => {
        asked += 1;
        return [];
      };
      declare(game, brute);
      expect(asked).toBe(0);
      expect(elves.every((id) => game.state.objects[id].tapped)).toBe(true);
      expect(life(game, B)).toBe(17);
    });
  });

  it("each instance is its own optional cost, its bonus only its own (702.154d)", () => {
    const twice = defineCard({
      name: "Test Double Enlister",
      manaCost: "{1}",
      types: ["creature"],
      subtypes: ["Soldier"],
      power: 1,
      toughness: 1,
      static: [enlist(), enlist()],
      text: "Enlist, enlist",
    });
    const { game, a } = table({ registry: createDefaultRegistry().register(twice) });
    const doubled = spawn(game, "Test Double Enlister");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const offered: ObjectId[][] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push([...eligible]);
      return [eligible[0]];
    };
    attack(game, a, [doubled]);
    expect(offered.length).toBe(2);
    expect(offered[1]).toHaveLength(1);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(true);
    // 1 + the Bears' 2 + the Giant's 3.
    expect(life(game, B)).toBe(14);
  });
});
