/**
 * A cost keyed to a spell's target. "Spells your opponents cast that target
 * this creature cost {2} more" (`targetedBySpellsCost.payGeneric` — Boreal
 * Elemental), granted (Jubilant Skybonder), read against a filter (Kopala, with
 * its abilities' half), and "costs {3} less if it targets a creature whose
 * controller has eight or more cards in their graveyard" (Lullmage's
 * Domination). The total is fixed once targets are chosen (rules 601.2c,
 * 601.2f): an increase comes before any reduction, and a target its caster
 * can't afford isn't offered.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { fitCastTargets } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { maxXForTargets } from "../target-count.js";
import { A, B, activate, cast, controller, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((l): l is CastOffer => l.kind === "cast-spell" && l.card === card);

type ActivationOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const activationOffers = (game: Game, source: ObjectId): ActivationOffer[] =>
  game.legalActions(A).filter((l): l is ActivationOffer => l.kind === "activate-ability" && l.source === source);

/** The objects offered for `card`'s slot `slot`, or null when it isn't offered. */
const offered = (game: Game, card: ObjectId, slot = 0): ObjectId[] | null => {
  const offer = castOffers(game, card)[0];
  if (offer === undefined) return null;
  return (offer.targetOptions[slot] ?? []).flatMap((t) => (t.kind === "object" ? [t.object] : []));
};

const untappedLands = (game: Game, player: PlayerId = A): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === player && !o.tapped && game.registry.get(o.cardName).types.includes("land");
  }).length;

describe("Spells your opponents cast that target this creature cost {N} more", () => {
  it("Boreal Elemental: the caster pays {2} more, and it comes out of their lands", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Murder"), { targets: [ref(boreal)] });
    expect(zone(game, boreal)).toBe("graveyard");
    expect(untappedLands(game)).toBe(0);
  });

  it("Boreal Elemental: a target its caster can't afford isn't offered, and is refused", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const murder = toHand(game, "Murder");
    expect(offered(game, murder)).toEqual([bears]);
    expect(() => cast(game, murder, { targets: [ref(boreal)] })).toThrow(/cannot pay/);
    cast(game, murder, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(untappedLands(game)).toBe(1);
  });

  it("no legal target it can afford: the spell isn't offered at all", () => {
    const { game } = table();
    spawn(game, "Boreal Elemental", B);
    lands(game, "Swamp", 4);
    expect(offered(game, toHand(game, "Murder"))).toBeNull();
  });

  it("its controller pays nothing", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", A);
    lands(game, "Swamp", 3);
    const murder = toHand(game, "Murder");
    expect(offered(game, murder)).toContain(boreal);
    cast(game, murder, { targets: [ref(boreal)] });
    expect(zone(game, boreal)).toBe("graveyard");
  });

  it("gone with its abilities: Ovinize leaves no tax until end of turn", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Ovinize"), { targets: [ref(boreal)] });
    expect(untappedLands(game)).toBe(0);
    lands(game, "Swamp", 3);
    const murder = toHand(game, "Murder");
    expect(offered(game, murder)).toContain(boreal);
  });

  it("beside a reduction: Price of Fame costs {3}{B} and {2}, less its {2} at a legendary creature", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    const kopala = spawn(game, "Kopala, Warden of Waves", B);
    const fame = toHand(game, "Price of Fame");
    lands(game, "Swamp", 3);
    expect(offered(game, fame)).toBeNull();
    lands(game, "Swamp", 1);
    expect(offered(game, fame)).toEqual([kopala]);
    lands(game, "Swamp", 2);
    expect(offered(game, fame)?.sort()).toEqual([boreal, kopala].sort());
    cast(game, fame, { targets: [ref(boreal)] });
    expect(untappedLands(game)).toBe(0);
  });

  it("an X spell: the target leaves that much less for X, and more is refused", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    const blaze = toHand(game, "Blaze");
    const offer = castOffers(game, blaze)[0];
    expect(offer.xCost?.maxX).toBe(4);
    expect(maxXForTargets(offer.xCost!, offer.targetCount, [ref(boreal)])).toBe(2);
    expect(maxXForTargets(offer.xCost!, offer.targetCount, [ref(B)])).toBe(4);
    expect(() => cast(game, blaze, { targets: [ref(boreal)], x: 3 })).toThrow(/cannot pay/);
    cast(game, blaze, { targets: [ref(boreal)], x: 2 });
    expect(untappedLands(game)).toBe(0);
  });

  it("a modal spell: a mode's targets leave out what's too dear", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    const charm = toHand(game, "Izzet Charm");
    const damage = castOffers(game, charm)[0].castModal!.modes.find((m) => /damage/.test(m.text))!;
    const objects = damage.targetOptions[0].flatMap((t) => (t.kind === "object" ? [t.object] : []));
    expect(objects).toContain(bears);
    expect(objects).not.toContain(boreal);
  });

  it("offered once it's affordable: Shock is {2}{R} at it, which two Mountains can't pay", () => {
    const { game } = table();
    const boreal = spawn(game, "Boreal Elemental", B);
    lands(game, "Mountain", 2);
    const shock = toHand(game, "Shock");
    expect(offered(game, shock)).not.toContain(boreal);
    lands(game, "Mountain", 1);
    expect(offered(game, shock)).toContain(boreal);
  });
});

describe("granted: Jubilant Skybonder", () => {
  it("each creature it reaches has the ability: two targeted, {2} each; the same one twice, {2} once", () => {
    const { game } = table();
    spawn(game, "Jubilant Skybonder", B);
    const drake = spawn(game, "Wind Drake", B);
    const other = spawn(game, "Wind Drake", B);
    lands(game, "Island", 7);
    cast(game, toHand(game, "Frost Breath"), { targets: [ref(drake), ref(other)] });
    // {2}{U} and {4}.
    expect(untappedLands(game)).toBe(0);
  });

  it("a creature without flying has no such ability", () => {
    const { game } = table();
    spawn(game, "Jubilant Skybonder", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    expect(offered(game, toHand(game, "Murder"))).toEqual([bears]);
  });

  it("Jubilant Skybonder has its own, and two of them are two instances", () => {
    const { game } = table();
    const one = spawn(game, "Jubilant Skybonder", B);
    spawn(game, "Jubilant Skybonder", B);
    lands(game, "Swamp", 6);
    const murder = toHand(game, "Murder");
    expect(offered(game, murder)).toBeNull();
    lands(game, "Swamp", 1);
    expect(offered(game, murder)).toContain(one);
    cast(game, murder, { targets: [ref(one)] });
    expect(untappedLands(game)).toBe(0);
  });

  it("two targets that pass alone but are too dear together: the fit says so, and the cast is refused", () => {
    const { game } = table();
    spawn(game, "Jubilant Skybonder", B);
    const drake = spawn(game, "Wind Drake", B);
    const other = spawn(game, "Wind Drake", B);
    lands(game, "Island", 5);
    const breath = toHand(game, "Frost Breath");
    const offer = castOffers(game, breath)[0];
    expect(offer.targetTaxes?.afford).toBe(2);
    const targets = [ref(drake), ref(other)];
    expect(fitCastTargets(offer, targets, offer.targetOptions, offer.targetSpecs)).toBeNull();
    expect(fitCastTargets(offer, [ref(drake), null], offer.targetOptions, offer.targetSpecs)).toEqual([ref(drake), null]);
    expect(() => cast(game, breath, { targets })).toThrow(/cannot pay/);
  });
});

describe("Kopala, Warden of Waves", () => {
  it("a spell at a Merfolk its controller controls pays {2}, once however many it names", () => {
    const { game } = table();
    spawn(game, "Kopala, Warden of Waves", B);
    const lord = spawn(game, "Lord of Atlantis", B);
    const reejerey = spawn(game, "Merrow Reejerey", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Frost Breath"), { targets: [ref(lord), ref(reejerey)] });
    expect(untappedLands(game)).toBe(0);
  });

  it("nothing for what isn't theirs, or isn't a Merfolk", () => {
    const { game } = table();
    spawn(game, "Kopala, Warden of Waves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Lord of Atlantis", A);
    lands(game, "Swamp", 3);
    const offers = offered(game, toHand(game, "Murder"));
    expect(offers).toContain(bears);
    expect(offers).toContain(mine);
    expect(offers?.length).toBe(2);
  });

  it("its controller's own spell pays nothing", () => {
    const { game } = table();
    spawn(game, "Kopala, Warden of Waves", A);
    const lord = spawn(game, "Lord of Atlantis", A);
    lands(game, "Swamp", 3);
    expect(offered(game, toHand(game, "Murder"))).toContain(lord);
  });

  it("an opponent's activation at a Merfolk costs {2} more, and isn't offered without it", () => {
    const { game } = table();
    const kopala = spawn(game, "Kopala, Warden of Waves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const pinger = spawn(game, "Prodigal Sorcerer", A);
    game.state.objects[pinger].enteredBattlefieldOnTurn = -1;
    lands(game, "Island", 1);
    const objects = (): ObjectId[] =>
      activationOffers(game, pinger).flatMap((o) =>
        o.targetOptions.flat().flatMap((t) => (t.kind === "object" ? [t.object] : [])),
      );
    expect(objects()).toContain(bears);
    expect(objects()).not.toContain(kopala);
    expect(() => activate(game, pinger, 0, { targets: [ref(kopala)] })).toThrow(/cannot pay/);
    lands(game, "Island", 1);
    expect(objects()).toContain(kopala);
    activate(game, pinger, 0, { targets: [ref(kopala)] });
    expect(untappedLands(game)).toBe(0);
  });

  it("an X ability is offered once per X, each X with the targets it leaves affordable", () => {
    const { game } = table();
    const kopala = spawn(game, "Kopala, Warden of Waves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const elemental = spawn(game, "Cinder Elemental", A);
    game.state.objects[elemental].enteredBattlefieldOnTurn = -1;
    lands(game, "Mountain", 4);
    const at = (x: number): ObjectId[] =>
      activationOffers(game, elemental)
        .filter((o) => o.xCost?.minX === x && o.xCost.maxX === x)
        .flatMap((o) => o.targetOptions.flat().flatMap((t) => (t.kind === "object" ? [t.object] : [])));
    expect(at(1)).toContain(kopala);
    expect(at(2)).not.toContain(kopala);
    expect(at(3)).toContain(bears);
    expect(() => activate(game, elemental, 0, { targets: [ref(kopala)], x: 2 })).toThrow(/cannot pay/);
    activate(game, elemental, 0, { targets: [ref(kopala)], x: 1 });
    expect(untappedLands(game)).toBe(0);
  });

  it("its controller's own activation, or one at something else, costs nothing more", () => {
    const { game } = table();
    spawn(game, "Kopala, Warden of Waves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const pinger = spawn(game, "Prodigal Sorcerer", A);
    game.state.objects[pinger].enteredBattlefieldOnTurn = -1;
    activate(game, pinger, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });
});

describe("Lullmage's Domination: {3} less if the target's controller has eight or more cards in their graveyard", () => {
  const fill = (game: Game, player: PlayerId, n: number): void => {
    for (let i = 0; i < n; i += 1) toGraveyard(game, "Wastes", player);
  };

  it("with eight, a mana value 2 creature is taken for {U}{U}{U}", () => {
    const { game } = table();
    fill(game, B, 8);
    const piker = spawn(game, "Goblin Piker", B);
    lands(game, "Island", 3);
    const domination = toHand(game, "Lullmage's Domination");
    cast(game, domination, { targets: [ref(piker)], x: 2 });
    expect(controller(game, piker)).toBe(A);
    expect(untappedLands(game)).toBe(0);
  });

  it("with seven, the full price: not offered at what three Islands can't pay", () => {
    const { game } = table();
    fill(game, B, 7);
    const piker = spawn(game, "Goblin Piker", B);
    lands(game, "Island", 3);
    const domination = toHand(game, "Lullmage's Domination");
    expect(castOffers(game, domination)).toEqual([]);
    expect(() => cast(game, domination, { targets: [ref(piker)], x: 2 })).toThrow();
  });

  it("each X is priced at its own targets: X=5 reached by the reduction, X=4 not", () => {
    const { game } = table();
    fill(game, B, 8);
    // Mana value 5 with the graveyard, 4 without.
    const earning = spawn(game, "Air Elemental", B);
    spawn(game, "Hill Giant", A);
    lands(game, "Island", 5);
    const domination = toHand(game, "Lullmage's Domination");
    const xs = castOffers(game, domination).map((o) => o.xCost?.minX);
    expect(xs).toEqual([5]);
    cast(game, domination, { targets: [ref(earning)], x: 5 });
    expect(controller(game, earning)).toBe(A);
  });

  it("and a tax on the target is paid on top: Boreal Elemental at X=5 is {2}{U}{U}{U} and {2}", () => {
    const { game } = table();
    fill(game, B, 8);
    const boreal = spawn(game, "Boreal Elemental", B);
    lands(game, "Island", 6);
    const domination = toHand(game, "Lullmage's Domination");
    expect(castOffers(game, domination)).toEqual([]);
    lands(game, "Island", 1);
    cast(game, domination, { targets: [ref(boreal)], x: 5 });
    expect(controller(game, boreal)).toBe(A);
    expect(untappedLands(game)).toBe(0);
  });

  it("reaches past the unreduced ceiling with the target that earns it, and only that one", () => {
    const { game } = table();
    fill(game, B, 8);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Goblin Piker", A);
    lands(game, "Island", 4);
    const domination = toHand(game, "Lullmage's Domination");
    const offer = castOffers(game, domination).find((o) => o.xCost?.minX === 2)!;
    const objects = offer.targetOptions[0].flatMap((t) => (t.kind === "object" ? [t.object] : []));
    expect(objects).toEqual([theirs]);
    expect(objects).not.toContain(mine);
    cast(game, domination, { targets: [ref(theirs)], x: 2 });
    expect(controller(game, theirs)).toBe(A);
  });
});
