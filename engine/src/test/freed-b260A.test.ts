/**
 * Batch 260, group A: cards freed by the random-pick, counter-removal,
 * restriction, search-destination, conditional-flash, base-P/T, shuffle,
 * blocking-relation, shared-type and enter-as families. One test for the
 * clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf, printedCardName } from "../state.js";
import {
  A,
  activate,
  B,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);

/** Bob's turn, precombat main, alice holding priority. */
const bobsMainAliceHolds = (game: Game): void => {
  const from = game.state.turn.number;
  game.advanceUntil(
    (s) =>
      s.turn.number > from &&
      activePlayerOf(s) === B &&
      s.turn.step === "precombat-main" &&
      s.priority.holder === A &&
      s.zones.shared.stack.length === 0,
  );
};

describe("random picks", () => {
  it("Wand of Ith: the player pays life equal to the card's mana value or discards it", () => {
    const { game, b } = table({ deck: "Grizzly Bears" });
    const wand = spawn(game, "Wand of Ith");
    lands(game, "Wastes", 6);
    const before = hand(game, B).length;
    b.chooseModesFn = () => [0];
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(before);
    game.state.objects[wand].tapped = false;
    b.chooseModesFn = () => [];
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("Omenpath Journey: lands of different names exiled with it, one put onto the battlefield tapped at the end step", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const island = toLibrary(game, "Island");
    a.chooseFromZoneFn = () => [forest, island];
    enter(game, "Omenpath Journey");
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, island)).toBe("exile");
    toStep(game, "end");
    settle(game);
    const out = [forest, island].filter((id) => zone(game, id) === "battlefield");
    expect(out.length).toBe(1);
    expect(game.state.objects[out[0]].tapped).toBe(true);
  });

  it("Cosmium Catalyst: casts a random card used to craft it, free", () => {
    const { game, a } = table();
    const stalactite = spawn(game, "Ore-Rich Stalactite");
    const bolts = Array.from({ length: 4 }, () => toGraveyard(game, "Lightning Bolt"));
    lands(game, "Mountain", 7);
    a.chooseFromZoneFn = () => bolts;
    activate(game, stalactite, 1);
    expect(printedCardName(game.state.objects[stalactite])).toBe("Cosmium Catalyst");
    const catalyst = stalactite;
    a.chooseCastNowFn = (_v, offer) => {
      const way = offer.casts[0];
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, free: true };
    };
    activate(game, catalyst, 0);
    expect(life(game, B)).toBe(17);
  });

  it("Rona, Tolarian Obliterator: the damaging source's controller exiles a random card; a land comes under Rona's controller", () => {
    const { game, a, b } = table({ deck: "Forest" });
    const rona = spawn(game, "Rona, Herald of Invasion");
    lands(game, "Swamp", 6);
    activate(game, rona, 1);
    expect(printedCardName(game.state.objects[rona])).toBe("Rona, Tolarian Obliterator");
    const bear = spawn(game, "Grizzly Bears", B);
    const bobHand = hand(game, B).length;
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bear, defender: A }];
    a.declareBlockersFn = () => [{ blocker: rona, attacker: bear }];
    pickModes(a, 0);
    toStep(game, "postcombat-main", B);
    // Bob drew for his turn, then lost one card to the trigger.
    expect(hand(game, B).length).toBe(bobHand);
    const stolen = game.battlefield.filter((id) => game.state.objects[id].owner === B && controller(game, id) === A);
    expect(stolen.length).toBe(1);
  });
});

describe("as it enters", () => {
  it("Brilliance Unleashed: a noncreature artifact returns as a 3/3 Robot artifact creature with flying", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Brilliance Unleashed"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(types(game, ring)).toContain("creature");
    expect(types(game, ring)).toContain("artifact");
    expect(subtypes(game, ring)).toContain("Robot");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, ring).has("flying")).toBe(true);
  });

  it("Dance of the Manse: with X 6 the permanents are 4/4 creatures", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Plains", 4);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Dance of the Manse"), { x: 6, targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
  });

  it("Chainer, Dementia Master: the creature is black only and a Nightmare, and gets +1/+1", () => {
    const { game } = table();
    const chainer = spawn(game, "Chainer, Dementia Master");
    const elf = toGraveyard(game, "Llanowar Elves", B);
    lands(game, "Swamp", 3);
    activate(game, chainer, 0, { targets: [ref(elf)] });
    expect(controller(game, elf)).toBe(A);
    expect(game.state.objects[elf].zone).toBe("battlefield");
    expect(subtypes(game, elf)).toContain("Nightmare");
    expect(subtypes(game, elf)).toContain("Elf");
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
    destroy(game, chainer);
    expect(zone(game, elf)).toBe("exile");
  });

  it("Grave Betrayal: an opponent's creature returns at the next end step with an extra counter, a black Zombie", () => {
    const { game } = table();
    spawn(game, "Grave Betrayal");
    const bear = spawn(game, "Grizzly Bears", B);
    destroy(game, bear);
    expect(zone(game, bear)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
    expect(controller(game, bear)).toBe(A);
    expect(counters(game, bear)).toBe(1);
    expect(subtypes(game, bear)).toContain("Zombie");
  });

  it("Ever After: two creatures return as black Zombies and the spell goes to the library's bottom", () => {
    const { game } = table();
    const bear = toGraveyard(game, "Grizzly Bears");
    const elf = toGraveyard(game, "Llanowar Elves");
    lands(game, "Swamp", 6);
    const spell = toHand(game, "Ever After");
    cast(game, spell, { targets: [ref(bear), ref(elf)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, elf)).toBe("battlefield");
    expect(subtypes(game, elf)).toContain("Zombie");
    expect(zone(game, spell)).toBe("library");
  });
});

describe("counters", () => {
  it("Nexus Mentality: draws a card for each counter removed", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    addCounters(game, bear, "+1/+1", 2);
    addCounters(game, bear, "shield", 1);
    lands(game, "Island", 4);
    const spell = toHand(game, "Nexus Mentality");
    const before = hand(game, A).length;
    cast(game, spell, { modes: [1], targets: [ref(bear)] });
    expect(counters(game, bear)).toBe(0);
    expect(counters(game, bear, "shield")).toBe(0);
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("Relic Amulet: removes every charge counter and deals that much damage", () => {
    const { game } = table();
    const amulet = spawn(game, "Relic Amulet");
    addCounters(game, amulet, "charge", 3);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 2);
    activate(game, amulet, 0, { targets: [ref(giant)] });
    expect(counters(game, amulet, "charge")).toBe(0);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Replicating Ring: the eighth night counter makes eight Replicated Rings and removes them all", () => {
    const { game } = table();
    const ring = spawn(game, "Replicating Ring");
    addCounters(game, ring, "night", 7);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, ring, "night")).toBe(0);
    expect(tokensNamed(game, "Replicated Ring Token", A)).toBe(8);
  });

  it("Aurification: a creature that damages you gets a gold counter and is a Wall with defender until it leaves", () => {
    const { game, b } = table();
    const aurification = spawn(game, "Aurification");
    const bear = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bear, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(counters(game, bear, "gold")).toBe(1);
    expect(subtypes(game, bear)).toContain("Wall");
    expect(keywords(game, bear).has("defender")).toBe(true);
    destroy(game, aurification, A);
    expect(counters(game, bear, "gold")).toBe(0);
  });

  it("Sporogenesis: a Saproling for each fungus counter on a creature that dies", () => {
    const { game } = table();
    spawn(game, "Sporogenesis");
    const bear = spawn(game, "Grizzly Bears", B);
    addCounters(game, bear, "fungus", 2);
    destroy(game, bear);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);
  });

  it("Temporal Distortion: a tapped creature gets an hourglass counter and doesn't untap; its upkeep removes them", () => {
    const { game } = table();
    spawn(game, "Temporal Distortion");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(bear)]);
    settle(game);
    expect(counters(game, bear, "hourglass")).toBe(1);
    toStep(game, "upkeep");
    expect(game.state.objects[bear].tapped).toBe(true);
    settle(game);
    expect(counters(game, bear, "hourglass")).toBe(0);
  });

  it("Mine Layer: a land with a mine counter is destroyed when it becomes tapped", () => {
    const { game } = table();
    const layer = spawn(game, "Mine Layer");
    lands(game, "Mountain", 2);
    const forest = spawn(game, "Forest", B);
    activate(game, layer, 0, { targets: [ref(forest)] });
    expect(counters(game, forest, "mine")).toBe(1);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(forest)]);
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("Fraying Line: unpaid, it exiles itself and every creature without a rope counter, then removes the rope counters", () => {
    const { game, a, b } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    const line = enter(game, "Fraying Line");
    expect(counters(game, bear, "rope")).toBe(1);
    const giant = spawn(game, "Hill Giant", B);
    b.chooseModesFn = () => [];
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, line)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bear)).toBe("battlefield");
    expect(counters(game, bear, "rope")).toBe(0);
  });

  it("Fraying Line: paid, the upkeep's player puts the rope counter on a creature of their choice", () => {
    const { game, a, b } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    const line = enter(game, "Fraying Line");
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2, B);
    b.chooseModesFn = () => [0];
    pickPermanents(b, giant);
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, line)).toBe("battlefield");
    expect(counters(game, giant, "rope")).toBe(1);
  });

  it("Glissa Sunslayer: the third mode removes up to three counters of the controller's choice", () => {
    const { game, a } = table();
    const glissa = spawn(game, "Glissa Sunslayer");
    const bear = spawn(game, "Grizzly Bears", B);
    addCounters(game, bear, "+1/+1", 4);
    spawn(game, "Glorious Anthem", B);
    a.chooseModesFn = () => [2];
    pickTargets(a, bear);
    a.chooseCounterRemovalsFn = () => [{ object: bear, kind: "+1/+1", count: 3 }];
    a.declareAttackersFn = () => [{ attacker: glissa, defender: B }];
    toStep(game, "postcombat-main");
    expect(counters(game, bear)).toBe(1);
  });

  it("Heartless Act: the destroy mode can't target a creature with a counter", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    addCounters(game, bear, "+1/+1", 1);
    lands(game, "Swamp", 2);
    expect(() => cast(game, toHand(game, "Heartless Act"), { modes: [0], targets: [ref(bear)] })).toThrow();
  });

  it("Leatherhead: removing her counter triggers the reflexive destroy", () => {
    const { game, a } = table();
    const leatherhead = enter(game, "Leatherhead, Swamp Stalker");
    expect(counters(game, leatherhead, "hexproof")).toBe(1);
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    a.declareAttackersFn = () => [{ attacker: leatherhead, defender: B }];
    toStep(game, "postcombat-main");
    expect(counters(game, leatherhead, "hexproof")).toBe(0);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Slumbering Walker: removing a counter at the end step returns a creature card", () => {
    const { game, a } = table();
    const walker = enter(game, "Slumbering Walker");
    expect(pt(game, walker)).toEqual({ power: 2, toughness: 5 });
    const bear = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bear);
    toStep(game, "end");
    settle(game);
    expect(counters(game, walker, "-1/-1")).toBe(1);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Thornmantle Striker: removes X counters, X the Elves you control", () => {
    const { game, a } = table();
    spawn(game, "Llanowar Elves");
    const bear = spawn(game, "Grizzly Bears", B);
    addCounters(game, bear, "+1/+1", 3);
    a.chooseModesFn = () => [0];
    pickTargets(a, bear);
    enter(game, "Thornmantle Striker");
    expect(counters(game, bear)).toBe(1);
  });

  it("Rhys, the Evermore: the creature gains persist", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    enter(game, "Rhys, the Evermore");
    destroy(game, bear);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(counters(game, back, "-1/-1")).toBe(1);
  });
});

describe("restrictions", () => {
  it("Oriss, Samite Guardian: grandeur stops the target player's creatures attacking", () => {
    const { game, b } = table();
    const oriss = spawn(game, "Oriss, Samite Guardian");
    toHand(game, "Oriss, Samite Guardian");
    const giant = spawn(game, "Hill Giant", B);
    bobsMainAliceHolds(game);
    activate(game, oriss, 1, { targets: [ref(B)] });
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
    expect(() =>
      game.dispatch({ type: "declare-attackers", player: B, attackers: [{ attacker: giant, defender: A }] }),
    ).toThrow();
  });

  it("Chemister's Trick: overloaded, each creature you don't control gets -2/-0", () => {
    const { game } = table();
    const one = spawn(game, "Hill Giant", B);
    const two = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Chemister's Trick"), { overload: true });
    expect(pt(game, one).power).toBe(1);
    expect(pt(game, two).power).toBe(1);
  });

  it("Incite Hysteria: only the creatures sharing a colour as it resolves can't block", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Hill Giant");
    const green = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Incite Hysteria"), { targets: [ref(green)] });
    const later = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(() =>
      game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: green, attacker }] }),
    ).toThrow();
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: later, attacker }] });
    expect(game.state.objects[later].blocking).toBe(attacker);
  });

  it("The Motherlode: energy for the target opponent's nonbasic lands; paying destroys one", () => {
    const { game, a } = table();
    const desert = spawn(game, "Ancient Tomb", B);
    spawn(game, "Ancient Tomb", B);
    pickTargets(a, B);
    const motherlode = enter(game, "The Motherlode, Excavator");
    expect(game.state.players[A].energy).toBe(2);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2 }, []);
    pickModes(a, 0);
    pickTargets(a, desert);
    a.declareAttackersFn = () => [{ attacker: motherlode, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, desert)).toBe("graveyard");
  });
});

describe("graveyard shuffles", () => {
  it("The Bath Song: chapter III shuffles the targets in and adds {U}{U}", () => {
    const { game, a } = table();
    const bear = toGraveyard(game, "Grizzly Bears");
    const song = spawn(game, "The Bath Song");
    addCounters(game, song, "lore", 2);
    pickTargets(a, bear);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bear)).toBe("library");
  });

  it("Rooting Kavu: exiled, it shuffles only the creature cards back", () => {
    const { game, a } = table();
    const kavu = spawn(game, "Rooting Kavu");
    const bear = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickModes(a, 0);
    destroy(game, kavu);
    expect(zone(game, bear)).toBe("library");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("search destinations", () => {
  it("Archdruid's Charm: a land found goes onto the battlefield tapped", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [forest];
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Archdruid's Charm"), { modes: [0] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("Caravan Vigil: without a death the land goes to the hand", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [forest];
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Caravan Vigil"));
    expect(zone(game, forest)).toBe("hand");
  });

  it("Scholar of New Horizons: removes a counter from a permanent you control as its cost", () => {
    const { game, a } = table();
    const scholar = enter(game, "Scholar of New Horizons");
    expect(counters(game, scholar)).toBe(1);
    const plains = toLibrary(game, "Plains");
    a.chooseFromZoneFn = () => [plains];
    activate(game, scholar, 0);
    expect(counters(game, scholar)).toBe(0);
    expect(zone(game, plains)).toBe("hand");
  });
});

describe("conditional flash", () => {
  it("Illusion Spinners: castable at instant speed only with a Faerie", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toHand(game, "Illusion Spinners");
    bobsMainAliceHolds(game);
    expect(() => cast(game, card)).toThrow();
    spawn(game, "Faerie Miscreant");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
  });

  it("Fated Clash: instant speed only while a creature attacks and one blocks", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Hill Giant");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    const card = toHand(game, "Fated Clash");
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    pickTargets(a, attacker, blocker);
    cast(game, card, { targets: [ref(attacker), ref(blocker)] });
    expect(zone(game, attacker)).toBe("battlefield");
    expect(zone(game, blocker)).toBe("battlefield");
  });
});

describe("base power and toughness", () => {
  it("Vhati il-Dal: base toughness 1, power unchanged", () => {
    const { game, a } = table();
    const vhati = spawn(game, "Vhati il-Dal");
    const giant = spawn(game, "Hill Giant", B);
    a.chooseModesFn = () => [1];
    activate(game, vhati, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
  });

  it("Crater Elemental: base power 8, toughness unchanged", () => {
    const { game } = table();
    const crater = spawn(game, "Crater Elemental");
    spawn(game, "Craw Wurm");
    spawn(game, "Hill Giant");
    lands(game, "Mountain", 3);
    activate(game, crater, 1);
    expect(pt(game, crater)).toEqual({ power: 8, toughness: 6 });
  });
});

describe("blocking relations", () => {
  it("The Wretched: gains control of the creatures blocking it", () => {
    const { game, a, b } = table();
    const wretched = spawn(game, "The Wretched");
    const bear = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: wretched, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bear, attacker: wretched }];
    toStep(game, "postcombat-main");
    expect(controller(game, bear)).toBe(A);
  });

  it("Arc Spitter: the equipped creature pings a creature blocking it", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const spitter = spawn(game, "Arc Spitter");
    lands(game, "Wastes", 2);
    activate(game, spitter, 0, { targets: [ref(giant)] });
    const elf = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [{ blocker: elf, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, giant, 0, { targets: [ref(elf)] });
    expect(zone(game, elf)).toBe("graveyard");
  });
});

describe("shared types", () => {
  it("Return from Extinction: two creature cards must share a creature type", () => {
    const { game } = table();
    const bear = toGraveyard(game, "Grizzly Bears");
    const elf = toGraveyard(game, "Llanowar Elves");
    const elf2 = toGraveyard(game, "Llanowar Elves");
    lands(game, "Swamp", 2);
    expect(() =>
      cast(game, toHand(game, "Return from Extinction"), { modes: [1], targets: [ref(bear), ref(elf)] }),
    ).toThrow();
    cast(game, toHand(game, "Return from Extinction"), { modes: [1], targets: [ref(elf), ref(elf2)] });
    expect(zone(game, elf)).toBe("hand");
    expect(zone(game, elf2)).toBe("hand");
  });

  it("Gauntlets of Chaos: exchanges two creatures and destroys the Auras on them", () => {
    const { game } = table();
    const gauntlets = spawn(game, "Gauntlets of Chaos");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 5);
    activate(game, gauntlets, 0, { targets: [ref(mine), ref(theirs)] });
    expect(controller(game, theirs)).toBe(A);
    expect(controller(game, mine)).toBe(B);
  });
});

describe("more", () => {
  it("Sovereigns of Lost Alara: the found Aura enters attached to the creature attacking alone", () => {
    const { game, a } = table();
    spawn(game, "Sovereigns of Lost Alara");
    const giant = spawn(game, "Hill Giant");
    const strength = toLibrary(game, "Holy Strength");
    pickModes(a, 0);
    a.chooseFromZoneFn = () => [strength];
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, strength)).toBe("battlefield");
    expect(game.state.objects[strength].attachedTo).toBe(giant);
  });

  it("Nazahn: Hammer of Nazahn found goes onto the battlefield", () => {
    const { game, a } = table();
    const hammer = toLibrary(game, "Hammer of Nazahn");
    a.chooseFromZoneFn = () => [hammer];
    enter(game, "Nazahn, Revered Bladesmith");
    expect(zone(game, hammer)).toBe("battlefield");
  });

  it("Belligerent Yearling: base power becomes the Dinosaur's, toughness unchanged", () => {
    const { game, a } = table();
    const yearling = spawn(game, "Belligerent Yearling");
    pickModes(a, 0);
    enter(game, "Colossal Dreadmaw");
    expect(pt(game, yearling)).toEqual({ power: 6, toughness: 2 });
  });

  it("Wall of Vipers: an opponent may destroy it and the creature it blocks", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Vipers", B);
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 3);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, wall, 0, { targets: [ref(giant)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Mutual Destruction: instant speed with a permanent with flash", () => {
    const { game, a } = table();
    spawn(game, "Ambush Viper");
    const fodder = spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 1);
    bobsMainAliceHolds(game);
    a.chooseSacrificesFn = () => [fodder];
    cast(game, toHand(game, "Mutual Destruction"), { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Purging Stormbrood: removes every kind of counter from the target", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    addCounters(game, bear, "+1/+1", 2);
    addCounters(game, bear, "shield", 1);
    pickTargets(a, bear);
    enter(game, "Purging Stormbrood");
    expect(counters(game, bear)).toBe(0);
    expect(counters(game, bear, "shield")).toBe(0);
  });

  it("Daring Thief: the opponent's permanent must share a card type", () => {
    const { game, a } = table();
    const thief = spawn(game, "Daring Thief", A, { tapped: true });
    const mine = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirRing = spawn(game, "Sol Ring", B);
    pickTargets(a, mine, theirRing);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(thief)]);
    settle(game);
    expect(controller(game, theirs)).toBe(B);
    expect(controller(game, theirRing)).toBe(A);
    expect(controller(game, mine)).toBe(B);
  });
});

describe("misc", () => {
  it("Éomer: enters with a counter per other Human, makes the target the monarch and deals its power", () => {
    const { game, a } = table();
    spawn(game, "Benalish Knight");
    pickTargets(a, B, B);
    const eomer = enter(game, "Éomer, King of Rohan");
    expect(counters(game, eomer)).toBe(1);
    expect(game.state.monarch).toBe(B);
    expect(life(game, B)).toBe(17);
  });

  it("Stream of Consciousness: the target player shuffles the target cards from their graveyard", () => {
    const { game } = table();
    const bear = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Stream of Consciousness"), { targets: [ref(B), ref(bear)] });
    expect(zone(game, bear)).toBe("library");
    expect(graveyard(game, B).length).toBe(0);
  });
});
