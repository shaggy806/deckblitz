/**
 * Set walk batch 92, part b (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { blockedByAtMostOne } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
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
  pickFromZone,
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
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
/** `n` permanent cards (Grizzly Bears) in `player`'s graveyard. */
const permanentCards = (game: Game, n: number, player: PlayerId = A): ObjectId[] =>
  Array.from({ length: n }, () => toGraveyard(game, "Grizzly Bears", player));
/** Descend: a permanent card put into alice's graveyard (a creature of hers destroyed). */
const descend = (game: Game): void => destroy(game, spawn(game, "Grizzly Bears"));

describe("Sanguine Evangelist", () => {
  it("makes a Bat as it enters and another as it dies", () => {
    const { game } = table();
    const evangelist = enter(game, "Sanguine Evangelist");
    expect(tokensNamed(game, "Bat Token", A)).toBe(1);
    destroy(game, evangelist);
    expect(zone(game, evangelist)).toBe("graveyard");
    expect(tokensNamed(game, "Bat Token", A)).toBe(2);
  });

  it("battle cry pumps each other attacking creature, not itself", () => {
    const { game, a } = table();
    const evangelist = spawn(game, "Sanguine Evangelist");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [evangelist, bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, evangelist)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Self-Reflection", () => {
  it("copies a creature you control, then again by flashback from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 10);
    const bears = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Self-Reflection");
    cast(game, spell, { targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(zone(game, spell)).toBe("graveyard");
    cast(game, spell, { via: "flashback", targets: [ref(bears)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(2);
    expect(zone(game, spell)).toBe("exile");
  });
});

describe("Oaken Siren", () => {
  it("its {U} casts an artifact spell but not a nonartifact one", () => {
    const { game } = table();
    spawn(game, "Oaken Siren");
    const ring = toHand(game, "Sol Ring");
    const opt = toHand(game, "Opt");
    expect(canCast(game, ring)).toBe(true);
    expect(canCast(game, opt)).toBe(false);
  });
});

describe("Akawalli, the Seething Tower", () => {
  it("descend 4 gives +2/+2 and trample; descend 8 another +2/+2 and one blocker at most", () => {
    const { game } = table();
    const akawalli = spawn(game, "Akawalli, the Seething Tower");
    permanentCards(game, 3);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Opt");
    // Three permanent cards — the instants don't count.
    expect(pt(game, akawalli)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, akawalli).has("trample")).toBe(false);
    permanentCards(game, 1);
    expect(pt(game, akawalli)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, akawalli).has("trample")).toBe(true);
    expect(blockedByAtMostOne(game.state, game.registry, akawalli)).toBe(false);
    permanentCards(game, 4);
    expect(pt(game, akawalli)).toEqual({ power: 7, toughness: 7 });
    expect(blockedByAtMostOne(game.state, game.registry, akawalli)).toBe(true);
  });
});

describe("Acrobatic Leap", () => {
  it("gives +1/+3 and flying and untaps the creature", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Acrobatic Leap"), { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Staunch Crewmate", () => {
  it("offers only an artifact or Pirate card from the top four, and bottoms the rest", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const pirate = toLibrary(game, "Plundering Pirate");
    const giant = toLibrary(game, "Hill Giant");
    const ring = toLibrary(game, "Sol Ring");
    const seen = pickFromZone(a, ring);
    enter(game, "Staunch Crewmate");
    expect([...seen.offered].sort()).toEqual([pirate, ring].sort());
    expect(zone(game, ring)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([bolt, pirate, giant].sort());
  });
});

describe("Stinging Cave Crawler", () => {
  it("draws and loses 1 life on attack with four permanent cards in the graveyard", () => {
    const { game, a } = table();
    const crawler = spawn(game, "Stinging Cave Crawler");
    permanentCards(game, 4);
    const before = hand(game).length;
    attack(game, a, [crawler]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });

  it("doesn't trigger with three permanent cards and instants", () => {
    const { game, a } = table();
    const crawler = spawn(game, "Stinging Cave Crawler");
    permanentCards(game, 3);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Opt");
    const before = hand(game).length;
    attack(game, a, [crawler]);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
  });
});

describe("Corpses of the Lost", () => {
  it("makes a Skeleton Pirate that gets +1/+0 and haste", () => {
    const { game } = table();
    enter(game, "Corpses of the Lost");
    const [skeleton] = tokensOf(game, "Skeleton Pirate Token");
    expect(pt(game, skeleton)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, skeleton).has("haste")).toBe(true);
  });

  it("returns to hand for 1 life at your end step if you descended", () => {
    const { game, a } = table();
    const corpses = spawn(game, "Corpses of the Lost");
    descend(game);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, corpses)).toBe("hand");
    expect(life(game)).toBe(19);
  });

  it("may decline the payment, and doesn't trigger without a descent", () => {
    const { game, a } = table();
    const corpses = spawn(game, "Corpses of the Lost");
    descend(game);
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, corpses)).toBe("battlefield");
    expect(life(game)).toBe(20);
    // Next end step of alice's, no descent: no trigger, no question.
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    expect(zone(game, corpses)).toBe("battlefield");
  });
});

describe("Akal Pakal, First Among Equals", () => {
  it("at an opponent's end step, looks at two after an artifact entered under your control — even one gone since", () => {
    const { game, a } = table();
    spawn(game, "Akal Pakal, First Among Equals");
    nextTurn(game);
    const thopter = enter(game, "Ornithopter");
    destroy(game, thopter);
    const top = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, top);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, top)).toBe("hand");
    expect(zone(game, second)).toBe("graveyard");
  });

  it("doesn't trigger when no artifact entered under your control", () => {
    const { game } = table();
    spawn(game, "Akal Pakal, First Among Equals");
    enter(game, "Ornithopter", B);
    enter(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    toStep(game, "end");
    settle(game);
    expect(zone(game, top)).toBe("library");
  });
});

describe("Mischievous Pup", () => {
  it("returns up to one other permanent you control, or none", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    const pup = enter(game, "Mischievous Pup");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, pup)).toBe("battlefield");
    pickTargets(a, null);
    enter(game, "Mischievous Pup");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Stalactite Stalker", () => {
  it("grows at your end step only if you descended", () => {
    const { game } = table();
    const stalker = spawn(game, "Stalactite Stalker");
    toStep(game, "end");
    settle(game);
    expect(counters(game, stalker)).toBe(0);
    toStep(game, "precombat-main");
    descend(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, stalker)).toBe(1);
  });

  it("gives -X/-X equal to its power as it was sacrificed", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const stalker = spawn(game, "Stalactite Stalker");
    game.state.objects[stalker].counters["+1/+1"] = 1;
    const giant = spawn(game, "Ghalta, Primal Hunger", B);
    activate(game, stalker, 0, { targets: [ref(giant)] });
    expect(zone(game, stalker)).toBe("graveyard");
    expect(pt(game, giant)).toEqual({ power: 10, toughness: 10 });
  });
});

describe("Nurturing Bristleback", () => {
  it("makes a vanilla 3/3 green Dinosaur", () => {
    const { game } = table();
    enter(game, "Nurturing Bristleback");
    const [dino] = tokensOf(game, "3/3 Dinosaur Token");
    expect(pt(game, dino)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, dino).size).toBe(0);
    expect(game.state.objects[dino].isToken).toBe(true);
  });
});

describe("Join the Dead", () => {
  it("gives -5/-5, or -10/-10 instead with four permanent cards in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const brontodon = spawn(game, "Ancient Brontodon", B);
    permanentCards(game, 3);
    toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Join the Dead"), { targets: [ref(brontodon)] });
    expect(pt(game, brontodon)).toEqual({ power: 4, toughness: 4 });
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    permanentCards(game, 1);
    cast(game, toHand(game, "Join the Dead"), { targets: [ref(ghalta)] });
    expect(pt(game, ghalta)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Grasping Shadows // Shadows' Lair", () => {
  it("an attacker alone gains deathtouch and lifelink; the third time it transforms, keeping its counters", () => {
    const { game, a } = table();
    const shadows = spawn(game, "Grasping Shadows");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(counters(game, shadows, "dread")).toBe(1);
    // Two attackers: not alone, no trigger.
    toStep(game, "precombat-main");
    attack(game, a, [bears, giant]);
    expect(keywords(game, giant).has("deathtouch")).toBe(false);
    expect(counters(game, shadows, "dread")).toBe(1);
    toStep(game, "precombat-main");
    attack(game, a, [giant]);
    expect(counters(game, shadows, "dread")).toBe(2);
    expect(types(game, shadows)).toContain("enchantment");
    toStep(game, "precombat-main");
    attack(game, a, [giant]);
    expect(types(game, shadows)).toEqual(["land"]);
    expect(counters(game, shadows, "dread")).toBe(3);
  });

  it("Shadows' Lair removes a dread counter to draw and lose 1 life", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const lair = spawn(game, "Grasping Shadows");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(lair)]);
    expect(types(game, lair)).toEqual(["land"]);
    game.state.objects[lair].counters.dread = 1;
    const before = hand(game).length;
    activate(game, lair, 1);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
    expect(counters(game, lair, "dread")).toBe(0);
  });
});

describe("Chupacabra Echo", () => {
  it("gives an opponent's creature -X/-X, X the permanent cards in your graveyard", () => {
    const { game, a } = table();
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    permanentCards(game, 3);
    toGraveyard(game, "Lightning Bolt");
    permanentCards(game, 2, B);
    pickTargets(a, ghalta);
    enter(game, "Chupacabra Echo");
    expect(pt(game, ghalta)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Triumphant Chomp", () => {
  it("deals 2 with no Dinosaur bigger than that", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Triumphant Chomp"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("deals the greatest power among your Dinosaurs when that's more", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Ancient Brontodon");
    spawn(game, "Hill Giant");
    spawn(game, "Ancient Brontodon", B);
    const ghalta = spawn(game, "Ghalta, Primal Hunger", B);
    cast(game, toHand(game, "Triumphant Chomp"), { targets: [ref(ghalta)] });
    expect(game.state.objects[ghalta].damageMarked).toBe(9);
  });
});

describe("Wail of the Forgotten", () => {
  it("chooses one below descend 8", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    permanentCards(game, 7);
    const wail = toHand(game, "Wail of the Forgotten");
    expect(() => cast(game, wail, { modes: [0, 1], targets: [ref(giant), ref(B)] })).toThrow();
    cast(game, wail, { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("hand");
  });

  it("chooses all three with eight permanent cards in your graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    permanentCards(game, 8);
    const wail = toHand(game, "Wail of the Forgotten");
    const bHand = hand(game, B).length;
    const top = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, top);
    const graveBefore = graveyard(game).length;
    cast(game, wail, { modes: [0, 1, 2], targets: [ref(giant), ref(B)] });
    expect(zone(game, giant)).toBe("hand");
    expect(hand(game, B).length).toBe(bHand + 1 - 1);
    expect(zone(game, top)).toBe("hand");
    // Two looked-at cards and the spell itself.
    expect(graveyard(game).length).toBe(graveBefore + 3);
  });
});

describe("Out of Air", () => {
  it("costs {2} less targeting a creature spell, full price otherwise", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter, { settle: false });
    const counter = toHand(game, "Out of Air");
    const castAt = (target: ObjectId): Action => ({ type: "cast-spell", player: A, card: counter, targets: [ref(target)] });
    expect(game.canDispatch(castAt(thopter))).toBeNull();
    cast(game, counter, { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("can't be cast for {U}{U} against a noncreature spell", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ring = toHand(game, "Sol Ring");
    cast(game, ring, { settle: false });
    const counter = toHand(game, "Out of Air");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: counter, targets: [ref(ring)] })).not.toBeNull();
  });
});

describe("Queen's Bay Paladin", () => {
  it("returns a Vampire card with a finality counter as it enters, and you lose its mana value", () => {
    const { game, a } = table();
    const nighthawk = toGraveyard(game, "Vampire Nighthawk");
    pickTargets(a, nighthawk);
    enter(game, "Queen's Bay Paladin");
    expect(zone(game, nighthawk)).toBe("battlefield");
    expect(counters(game, nighthawk, "finality")).toBe(1);
    expect(life(game)).toBe(17);
    destroy(game, nighthawk);
    expect(zone(game, nighthawk)).toBe("exile");
  });

  it("returns one as it attacks; choosing none loses no life", () => {
    const { game, a } = table();
    const nighthawk = toGraveyard(game, "Vampire Nighthawk");
    pickTargets(a, null);
    const paladin = enter(game, "Queen's Bay Paladin");
    expect(life(game)).toBe(20);
    expect(zone(game, nighthawk)).toBe("graveyard");
    pickTargets(a, nighthawk);
    attack(game, a, [paladin]);
    expect(zone(game, nighthawk)).toBe("battlefield");
    expect(life(game)).toBe(17);
  });
});

describe("Forgotten Monument", () => {
  it("gives other Caves '{T}, Pay 1 life: Add one mana of any color', not itself", () => {
    const { game } = table();
    spawn(game, "Forgotten Monument");
    const bolt = toHand(game, "Lightning Bolt");
    expect(canCast(game, bolt)).toBe(false);
    spawn(game, "Forgotten Monument");
    expect(canCast(game, bolt)).toBe(true);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, bolt, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(19);
  });
});

describe("Coati Scavenger", () => {
  it("returns a permanent card with four permanent cards in your graveyard", () => {
    const { game, a } = table();
    const [bears] = permanentCards(game, 4);
    pickTargets(a, bears);
    enter(game, "Coati Scavenger");
    expect(zone(game, bears)).toBe("hand");
  });

  it("doesn't trigger with three permanent cards and an instant", () => {
    const { game, a } = table();
    const [bears] = permanentCards(game, 3);
    toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bears);
    enter(game, "Coati Scavenger");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Pirate Hat", () => {
  it("equips a Pirate for {1} (not another creature), which gets +1/+1 and loots as it attacks", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const hat = spawn(game, "Pirate Hat");
    const bears = spawn(game, "Grizzly Bears");
    const pirate = spawn(game, "Plundering Pirate");
    expect(() => activate(game, hat, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, hat, 0, { targets: [ref(pirate)] });
    expect(game.state.objects[hat].attachedTo).toBe(pirate);
    const base = pt(game, bears);
    expect(base).toEqual({ power: 2, toughness: 2 });
    const printed = game.registry.get("Plundering Pirate");
    expect(pt(game, pirate)).toEqual({ power: (printed.power ?? 0) + 1, toughness: (printed.toughness ?? 0) + 1 });
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    attack(game, a, [pirate]);
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(graveBefore + 1);
  });
});
