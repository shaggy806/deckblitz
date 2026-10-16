/**
 * Set walk batch 86, part a (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const tokensOf = (game: Game, name: string, player = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);

describe("Treeguard Duo", () => {
  it("gives target creature you control vigilance and +X/+X, X counted as the trigger resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    pickTargets(a, bears);
    enter(game, "Treeguard Duo");
    // Three creatures, the Duo included.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    // X doesn't change later in the turn.
    spawn(game, "Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "precombat-main");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });
});

describe("Rabid Gnaw", () => {
  it("pumps your creature, then it deals damage equal to its power to a creature you don't control", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rabid Gnaw"), { targets: [ref(bears), ref(giant)] });
    // 3 damage kills the 3/3; it deals none back.
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Spellgyre", () => {
  it("counters target spell", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Spellgyre"), { modes: [0], targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("or surveils 2, then draws two cards", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Lightning Bolt");
    a.chooseScryFn = (_view, cards) => cards;
    const spell = toHand(game, "Spellgyre");
    const before = hand(game).length;
    cast(game, spell, { modes: [1] });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    // Less the Spellgyre itself, plus two.
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Salvation Swan", () => {
  it("exiles a creature you control without flying and returns it with a flying counter at the next end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Air Elemental");
    spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Salvation Swan");
    // Only your creatures without flying: not the Air Elemental, the Swan or bob's.
    expect(seen.offered[0]).toEqual([bears]);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "flying")).toBe(1);
    expect(keywords(game, back[0]).has("flying")).toBe(true);
  });

  it("triggers for another Bird you control entering, and not for a non-Bird", () => {
    const { game, a } = table();
    spawn(game, "Salvation Swan");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Llanowar Elves");
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    enter(game, "Storm Crow");
    expect(seen.asked).toBe(1);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Polliwallop", () => {
  it("costs {1} less for each Frog, and deals twice your creature's power", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Stickytongue Sentinel");
    spawn(game, "Stickytongue Sentinel");
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    // {3}{G} less two Frogs: two lands pay it.
    cast(game, toHand(game, "Polliwallop"), { targets: [ref(bears), ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("isn't castable for {1}{G} without Frogs", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    expect(() => cast(game, toHand(game, "Polliwallop"), { targets: [ref(bears), ref(wurm)] })).toThrow();
  });
});

describe("Harnesser of Storms", () => {
  it("may exile the top card on a noncreature spell, playable this turn, once each turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Harnesser of Storms");
    const bolt = toLibrary(game, "Lightning Bolt");
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(15);
    // Already triggered this turn: the next noncreature spell exiles nothing.
    const next = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, next)).toBe("library");
  });

  it("triggers on an Otter creature spell but not another creature spell", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Harnesser of Storms");
    const top = toLibrary(game, "Lightning Bolt");
    pickModes(a, 0);
    cast(game, toHand(game, "Raging Goblin"));
    expect(zone(game, top)).toBe("library");
    cast(game, toHand(game, "Coruscation Mage"));
    expect(zone(game, top)).toBe("exile");
  });

  it("declining the exile leaves the card on top", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Harnesser of Storms");
    const top = toLibrary(game, "Lightning Bolt");
    pickModes(a);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, top)).toBe("library");
  });
});

describe("Mindwhisker", () => {
  it("with threshold, creatures your opponents control get -1/-0", () => {
    const { game } = table();
    spawn(game, "Mindwhisker");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Wastes");
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Wastes");
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Three Tree Scribe", () => {
  it("puts a counter when a creature you control leaves without dying, itself included, but not when one dies", () => {
    const { game, a } = table();
    const scribe = spawn(game, "Three Tree Scribe");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, elves);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(counters(game, elves)).toBe(1);
    // Dying isn't leaving without dying.
    const giant = spawn(game, "Hill Giant");
    destroy(game, elves);
    settle(game);
    expect(counters(game, giant)).toBe(0);
    // The Scribe itself leaving counts.
    pickTargets(a, giant);
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(scribe)]);
    settle(game);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Pawpatch Recruit", () => {
  it("offspring {2} makes a 1/1 token copy", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Pawpatch Recruit"), { kicked: true });
    const recruits = named(game, "Pawpatch Recruit", A);
    expect(recruits).toHaveLength(2);
    expect(tokensOf(game, "Pawpatch Recruit")).toHaveLength(1);
    expect(pt(game, tokensOf(game, "Pawpatch Recruit")[0])).toEqual({ power: 1, toughness: 1 });
  });

  it("when an opponent targets a creature you control, counters another creature you control", () => {
    const { game, a } = table();
    const recruit = spawn(game, "Pawpatch Recruit");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const seen = watchTargets(a, () => [elves]);
    nextTurn(game);
    spawn(game, "Mountain", B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bears)] });
    // Any creature you control but the targeted one.
    expect([...seen.offered[0]].sort()).toEqual([recruit, elves].sort());
    expect(counters(game, elves)).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("not when you target your own creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const recruit = spawn(game, "Pawpatch Recruit");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [recruit]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(seen.asked).toBe(0);
    expect(counters(game, recruit)).toBe(0);
  });
});

describe("Splash Lasher", () => {
  it("taps up to one target creature and stuns it", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "Splash Lasher");
    expect(isTapped(game, theirs)).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);
  });

  it("offspring {1}{U}: the token copy's own enters ability stuns too", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    cast(game, toHand(game, "Splash Lasher"), { kicked: true });
    expect(tokensOf(game, "Splash Lasher")).toHaveLength(1);
    expect(counters(game, theirs, "stun")).toBe(2);
  });
});

describe("Daring Waverider", () => {
  it("casts an instant with mana value 4 or less from your graveyard free, and exiles it", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const opt = toGraveyard(game, "Opt");
    toGraveyard(game, "Blasphemous Act");
    toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bolt]);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bolt)!;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    enter(game, "Daring Waverider");
    // Not the mana value 9 sorcery, nor a creature card.
    expect([...seen.offered[0]].sort()).toEqual([bolt, opt].sort());
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("Bonecache Overseer", () => {
  it("draws only once three cards have left your graveyard this turn", () => {
    const { game } = table();
    const overseer = spawn(game, "Bonecache Overseer");
    expect(() => activate(game, overseer)).toThrow();
    for (let i = 0; i < 2; i += 1) {
      const card = toGraveyard(game, "Grizzly Bears");
      game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(card)]);
    }
    expect(() => activate(game, overseer)).toThrow();
    // An opponent's card leaving their graveyard doesn't count.
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(theirs)]);
    expect(() => activate(game, overseer)).toThrow();
    const third = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(third)]);
    const before = hand(game).length;
    activate(game, overseer);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });

  it("or once you've sacrificed a Food this turn", () => {
    const { game } = table();
    const overseer = spawn(game, "Bonecache Overseer");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    settle(game);
    const food = named(game, "Food Token", A)[0];
    expect(() => activate(game, overseer)).toThrow();
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(food)]);
    settle(game);
    const before = hand(game).length;
    activate(game, overseer);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Valley Flamecaller", () => {
  it("adds 1 to damage a Lizard, Mouse, Otter or Raccoon you control deals, not other creatures'", () => {
    const { game, a } = table();
    spawn(game, "Valley Flamecaller");
    const assassin = spawn(game, "Agate-Blade Assassin");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [assassin, bears]);
    // The Lizard's 1 + 1, the Bear's 2, and the Assassin's life loss.
    expect(life(game, B)).toBe(15);
  });

  it("adds 1 to a Lizard's damage to a creature, and to its noncombat damage to a player", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Valley Flamecaller");
    const assassin = spawn(game, "Agate-Blade Assassin");
    const giant = spawn(game, "Hill Giant", B);
    // 1 + 1 power, plus 1: three damage to the 3/3.
    cast(game, toHand(game, "Rabid Gnaw"), { targets: [ref(assassin), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    // Agate Instigator (a Lizard) deals 1 to each opponent as another creature enters: 2.
    spawn(game, "Agate Instigator");
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(18);
  });

  it("without it, the same Rabid Gnaw leaves the 3/3 alive", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const assassin = spawn(game, "Agate-Blade Assassin");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rabid Gnaw"), { targets: [ref(assassin), ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Agate-Blade Assassin", () => {
  it("drains the defending player for 1 as it attacks", () => {
    const { game, a } = table();
    const assassin = spawn(game, "Agate-Blade Assassin");
    attack(game, a, [assassin]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(21);
  });
});

describe("Stickytongue Sentinel", () => {
  it("returns up to one other target permanent you control to its owner's hand", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [forest]);
    const sentinel = enter(game, "Stickytongue Sentinel");
    expect(seen.offered[0]).not.toContain(sentinel);
    expect(seen.offered[0]).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
    expect(keywords(game, sentinel).has("reach")).toBe(true);
  });
});

describe("Otterball Antics", () => {
  it("makes a 1/1 prowess Otter, with a +1/+1 counter when cast from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const antics = toHand(game, "Otterball Antics");
    cast(game, antics);
    const first = tokensOf(game, "Otter Token");
    expect(first).toHaveLength(1);
    expect(counters(game, first[0])).toBe(0);
    expect(zone(game, antics)).toBe("graveyard");
    cast(game, antics, { via: "flashback" });
    const both = tokensOf(game, "Otter Token");
    expect(both).toHaveLength(2);
    const second = both.find((id) => id !== first[0])!;
    expect(counters(game, second)).toBe(1);
    expect(pt(game, second)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, antics)).toBe("exile");
  });
});

describe("Longstalk Brawl", () => {
  it("unpromised, the two creatures just fight", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Longstalk Brawl"), { targets: [ref(bears), ref(theirs)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(named(game, "Fish Token", B)).toHaveLength(0);
  });

  it("promised, the opponent gets a tapped Fish and your creature a +1/+1 counter before the fight", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Longstalk Brawl"), { targets: [ref(bears), ref(theirs)], kicked: true });
    const fish = named(game, "Fish Token", B);
    expect(fish).toHaveLength(1);
    expect(isTapped(game, fish[0])).toBe(true);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });
});

