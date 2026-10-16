/**
 * Set walk batch 92, part d (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
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
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
/** `n` permanent cards (Grizzly Bears) into alice's graveyard. */
const permanentsInGraveyard = (game: Game, n: number): void => {
  for (let i = 0; i < n; i += 1) toGraveyard(game, "Grizzly Bears");
};
const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

describe("Malamet Veteran", () => {
  it("puts a +1/+1 counter on target creature as it attacks with four permanent cards in the graveyard", () => {
    const { game, a } = table();
    const vet = spawn(game, "Malamet Veteran");
    const bears = spawn(game, "Grizzly Bears");
    permanentsInGraveyard(game, 4);
    pickTargets(a, bears);
    attack(game, a, [vet]);
    expect(counters(game, bears)).toBe(1);
  });

  it("doesn't trigger with three permanent cards and an instant", () => {
    const { game, a } = table();
    const vet = spawn(game, "Malamet Veteran");
    const bears = spawn(game, "Grizzly Bears");
    permanentsInGraveyard(game, 3);
    toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bears);
    attack(game, a, [vet]);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, vet)).toBe(0);
  });
});

describe("Disturbed Slumber", () => {
  it("makes a land a 4/4 Dinosaur land creature with reach and haste that must be blocked if able", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const target = spawn(game, "Forest");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Disturbed Slumber"), { targets: [ref(target)] });
    // Whichever Forests paid, the animated one attacks untapped.
    game.state.objects[target].tapped = false;
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, target)).toEqual(expect.arrayContaining(["Forest", "Dinosaur"]));
    expect(pt(game, target)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, target).has("reach")).toBe(true);
    expect(keywords(game, target).has("haste")).toBe(true);
    const offer = blockOffer(game, a, [target]);
    expect(offer.mustBeBlockedIfAble).toEqual([target]);
  });

  it("wears off at end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const target = spawn(game, "Forest");
    cast(game, toHand(game, "Disturbed Slumber"), { targets: [ref(target)] });
    nextTurn(game);
    expect(types(game, target)).not.toContain("creature");
  });
});

describe("Orazca Puzzle-Door", () => {
  it("looks at the top two: the chosen one into the hand, the other into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const door = spawn(game, "Orazca Puzzle-Door");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Ornithopter");
    const seen = pickFromZone(a, second);
    activate(game, door);
    expect(seen.offered).toEqual(expect.arrayContaining([first, second]));
    expect(zone(game, door)).toBe("graveyard");
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("graveyard");
  });
});

describe("Malamet Scythe", () => {
  it("has flash and attaches itself to target creature you control as it enters, for +2/+2", () => {
    const { game, a } = table({ step: "begin-combat" });
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const scythe = toHand(game, "Malamet Scythe");
    cast(game, scythe);
    expect(game.state.objects[scythe].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Waylaying Pirates", () => {
  it("taps and stuns an opponent's artifact or creature when you control an artifact", () => {
    const { game } = table();
    spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Waylaying Pirates");
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });

  it("does nothing without an artifact", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Waylaying Pirates");
    expect(isTapped(game, bears)).toBe(false);
    expect(counters(game, bears, "stun")).toBe(0);
  });
});

describe("Glorifier of Suffering", () => {
  it("may sacrifice another creature or artifact; when it does, counters on up to two target creatures", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [thopter];
    };
    pickModes(a, 0);
    pickTargets(a, bears, giant);
    const glorifier = enter(game, "Glorifier of Suffering");
    expect(offered).not.toContain(glorifier);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });

  it("puts no counters when nothing is sacrificed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    a.chooseSacrificesFn = () => [];
    pickTargets(a, bears);
    enter(game, "Glorifier of Suffering");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Brazen Blademaster", () => {
  it("gets +2/+1 attacking while you control two artifacts", () => {
    const { game, a } = table();
    const blade = spawn(game, "Brazen Blademaster");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    attack(game, a, [blade]);
    expect(pt(game, blade)).toEqual({ power: 4, toughness: 4 });
  });

  it("gets nothing with only one artifact", () => {
    const { game, a } = table();
    const blade = spawn(game, "Brazen Blademaster");
    spawn(game, "Ornithopter");
    attack(game, a, [blade]);
    expect(pt(game, blade)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Quicksand Whirlpool", () => {
  it("costs {3} less when it targets a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Quicksand Whirlpool"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("can't be cast for {2}{W} at an untapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Quicksand Whirlpool"), { targets: [ref(bears)] })).toThrow(/refused/);
  });
});

describe("Thousand Moons Infantry", () => {
  it("untaps during another player's untap step", () => {
    const { game } = table();
    const infantry = spawn(game, "Thousand Moons Infantry", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(isTapped(game, infantry)).toBe(false);
    expect(isTapped(game, bears)).toBe(true);
  });
});

describe("Child of the Volcano", () => {
  it("gets a +1/+1 counter at your end step if you descended this turn", () => {
    const { game } = table();
    const child = spawn(game, "Child of the Volcano");
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    expect(counters(game, child)).toBe(1);
  });

  it("gets nothing if no permanent card went to your graveyard", () => {
    const { game } = table();
    const child = spawn(game, "Child of the Volcano");
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, child)).toBe(0);
  });
});

describe("Vanguard of the Rose", () => {
  it("sacrifices another creature or artifact to gain indestructible, and taps", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const vanguard = spawn(game, "Vanguard of the Rose");
    const thopter = spawn(game, "Ornithopter");
    const base = { type: "activate-ability", player: A, source: vanguard, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...base, sacrifice: vanguard })).not.toBeNull();
    game.dispatch({ ...base, sacrifice: thopter });
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(keywords(game, vanguard).has("indestructible")).toBe(true);
    expect(isTapped(game, vanguard)).toBe(true);
  });
});

describe("Basking Capybara", () => {
  it("gets +3/+0 with four permanent cards in your graveyard, not counting instants", () => {
    const { game } = table();
    const capy = spawn(game, "Basking Capybara");
    permanentsInGraveyard(game, 3);
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, capy)).toEqual({ power: 1, toughness: 3 });
    permanentsInGraveyard(game, 1);
    expect(pt(game, capy)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Frilled Cave-Wurm", () => {
  it("gets +2/+0 with four permanent cards in your graveyard, not an opponent's", () => {
    const { game } = table();
    const wurm = spawn(game, "Frilled Cave-Wurm");
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Grizzly Bears", B);
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 5 });
    permanentsInGraveyard(game, 4);
    expect(pt(game, wurm)).toEqual({ power: 4, toughness: 5 });
  });
});

describe("Didact Echo", () => {
  it("draws as it enters, and flies with four permanent cards in your graveyard", () => {
    const { game } = table();
    const before = hand(game).length;
    const echo = enter(game, "Didact Echo");
    expect(hand(game)).toHaveLength(before + 1);
    expect(keywords(game, echo).has("flying")).toBe(false);
    permanentsInGraveyard(game, 4);
    expect(keywords(game, echo).has("flying")).toBe(true);
  });
});

describe("Oltec Archaeologists", () => {
  it("returns target artifact card from your graveyard to your hand", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a, 0);
    pickTargets(a, ring);
    enter(game, "Oltec Archaeologists");
    expect(zone(game, ring)).toBe("hand");
  });

  it("or scries 3", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const top = toLibrary(game, "Grizzly Bears");
    let looked: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      looked = cards;
      return [];
    };
    pickModes(a, 1);
    enter(game, "Oltec Archaeologists");
    expect(looked).toHaveLength(3);
    expect(looked).toContain(top);
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Shipwreck Sentry", () => {
  it("can attack once an artifact entered under your control this turn, even one that has left since", () => {
    const { game } = table();
    const sentry = spawn(game, "Shipwreck Sentry");
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toMatch(/defender/);
    const thopter = enter(game, "Ornithopter");
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toBeNull();
    destroy(game, thopter);
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toBeNull();
  });

  it("an opponent's artifact entering doesn't count", () => {
    const { game } = table();
    const sentry = spawn(game, "Shipwreck Sentry");
    enter(game, "Ornithopter", B);
    expect(whyCannotAttack(game.state, game.registry, A, sentry, B)).toMatch(/defender/);
  });
});

describe("Song of Stupefaction", () => {
  it("may mill two, and gives -X/-0 for the permanent cards in your graveyard, live", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Song of Stupefaction"), { targets: [ref(giant)] });
    // The deck is Wastes: two land cards milled, two permanent cards.
    expect(graveyard(game)).toHaveLength(2);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
  });

  it("can't enchant a noncreature artifact that isn't a Vehicle", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const ring = spawn(game, "Sol Ring", B);
    expect(() => cast(game, toHand(game, "Song of Stupefaction"), { targets: [ref(ring)] })).toThrow(/refused/);
  });
});

describe("Ray of Ruin", () => {
  it("exiles a nonbasic land and scries 1", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const vein = spawn(game, "Promising Vein", B);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    cast(game, toHand(game, "Ray of Ruin"), { targets: [ref(vein)] });
    expect(zone(game, vein)).toBe("exile");
    expect(scried).toBe(1);
  });

  it("exiles a creature, but can't target a basic land", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const bears = spawn(game, "Grizzly Bears", B);
    const wastes = spawn(game, "Wastes", B);
    expect(() => cast(game, toHand(game, "Ray of Ruin"), { targets: [ref(wastes)] })).toThrow(/refused/);
    cast(game, toHand(game, "Ray of Ruin"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Sage of Days", () => {
  it("looks at three, may keep one on top, and the rest go to the graveyard", () => {
    const { game, a } = table();
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Ornithopter");
    pickFromZone(a, second);
    enter(game, "Sage of Days");
    expect(library(game)[0]).toBe(second);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
  });
});

describe("Burning Sun Cavalry", () => {
  it("gets +1/+1 attacking while you control a Dinosaur", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Burning Sun Cavalry");
    spawn(game, "Sinuous Benthisaur");
    attack(game, a, [cavalry]);
    expect(pt(game, cavalry)).toEqual({ power: 3, toughness: 3 });
  });

  it("and blocking", () => {
    const { game, a, b } = table();
    const cavalry = spawn(game, "Burning Sun Cavalry");
    spawn(game, "Sinuous Benthisaur");
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    a.declareBlockersFn = () => [{ blocker: cavalry, attacker: bears }];
    toStep(game, "postcombat-main", B);
    expect(pt(game, cavalry)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("gets nothing without a Dinosaur", () => {
    const { game, a } = table();
    const cavalry = spawn(game, "Burning Sun Cavalry");
    attack(game, a, [cavalry]);
    expect(pt(game, cavalry)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Council of Echoes", () => {
  it("with four permanent cards in your graveyard, returns up to one other nonland permanent", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    permanentsInGraveyard(game, 4);
    const seen = watchTargets(a, () => [bears]);
    const council = enter(game, "Council of Echoes");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(council);
    expect(zone(game, bears)).toBe("hand");
  });

  it("doesn't trigger with three", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    permanentsInGraveyard(game, 3);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Council of Echoes");
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Sinuous Benthisaur", () => {
  it("looks at Caves you control plus Cave cards in your graveyard: two to hand, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Promising Vein", 2);
    toGraveyard(game, "Promising Vein");
    spawn(game, "Promising Vein", B); // an opponent's Cave doesn't count
    const fourth = toLibrary(game, "Lightning Bolt");
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Ornithopter");
    const seen = pickFromZone(a, first, third);
    enter(game, "Sinuous Benthisaur");
    expect(seen.offered).toHaveLength(3);
    expect(seen.offered).not.toContain(fourth);
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, third)).toBe("hand");
    expect(library(game).at(-1)).toBe(second);
    expect(library(game)[0]).toBe(fourth);
  });

  it("with X of 1, the one card goes to the hand", () => {
    const { game } = table();
    lands(game, "Promising Vein", 1);
    const top = toLibrary(game, "Ornithopter");
    enter(game, "Sinuous Benthisaur");
    expect(zone(game, top)).toBe("hand");
  });
});

describe("Thousand Moons Crackshot", () => {
  it("may pay {2}{W} as it attacks to tap target creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const crackshot = spawn(game, "Thousand Moons Crackshot");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [crackshot]);
    expect(isTapped(game, bears)).toBe(true);
  });

  it("taps nothing when declined", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 3);
    const crackshot = spawn(game, "Thousand Moons Crackshot");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, bears);
    attack(game, a, [crackshot]);
    expect(isTapped(game, bears)).toBe(false);
    expect(plains.some((p) => isTapped(game, p))).toBe(false);
  });
});

describe("Calamitous Cave-In", () => {
  it("deals X to each creature and planeswalker: your Caves plus your Cave cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Promising Vein", 2);
    toGraveyard(game, "Promising Vein");
    spawn(game, "Promising Vein", B); // an opponent's Cave doesn't count
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Frilled Cave-Wurm", B);
    const garruk = spawn(game, "Garruk, Primal Hunter", B);
    game.state.objects[garruk].counters.loyalty = 4;
    cast(game, toHand(game, "Calamitous Cave-In"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(counters(game, garruk, "loyalty")).toBe(1);
  });
});
