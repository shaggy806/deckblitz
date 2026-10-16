/**
 * Set walk batch 86, part f (2026-10-15): Bloomburrow (BLB), Bloomburrow Commander (BLC), Mystery Booster 2 (MB2) and Assassin's Creed (ACR), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  type BlockOffer,
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
  life,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const attachedTo = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;
const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Aveline de Grandpré", () => {
  it("puts that many +1/+1 counters on a creature you control with deathtouch that deals combat damage to a player", () => {
    const { game, a } = table();
    const aveline = spawn(game, "Aveline de Grandpré");
    const rats = spawn(game, "Typhoid Rats");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [aveline, rats, bears]);
    expect(life(game, B)).toBe(20 - 3 - 1 - 2);
    expect(counters(game, aveline)).toBe(3);
    expect(counters(game, rats)).toBe(1);
    // No deathtouch, no counters.
    expect(counters(game, bears)).toBe(0);
  });

  it("can be cast face down with disguise and turned up for {B}{G}", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const aveline = toHand(game, "Aveline de Grandpré");
    cast(game, aveline, { via: "face-down" });
    expect(game.state.objects[aveline].faceDown?.kind).toBe("disguise");
    expect(pt(game, aveline)).toEqual({ power: 2, toughness: 2 });
    game.dispatch({ type: "turn-face-up", player: A, permanent: aveline, morph: true });
    settle(game);
    expect(pt(game, aveline)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, aveline).has("deathtouch")).toBe(true);
  });
});

describe("Havi, the All-Father", () => {
  it("has indestructible only with four or more historic cards in your graveyard", () => {
    const { game } = table();
    const havi = spawn(game, "Havi, the All-Father");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Isamaru, Hound of Konda");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Bonesplitter");
    expect(keywords(game, havi).has("indestructible")).toBe(false);
    // A legendary creature card is historic too: four now.
    toGraveyard(game, "Thalia, Guardian of Thraben");
    expect(keywords(game, havi).has("indestructible")).toBe(true);
  });

  it("returns a legendary creature card with lesser mana value, tapped, when another legendary creature you control dies", () => {
    const { game, a } = table();
    spawn(game, "Havi, the All-Father");
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    const isamaru = toGraveyard(game, "Isamaru, Hound of Konda");
    const second = toGraveyard(game, "Isamaru, Hound of Konda");
    const kenrith = toGraveyard(game, "Kenrith, the Returned King");
    toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [isamaru]);
    destroy(game, thalia);
    // Only the Isamarus (1) are legendary creature cards with mana value
    // less than Thalia's 2 — not Kenrith (5), not the bears, not Thalia.
    expect([...seen.offered[0]].sort()).toEqual([isamaru, second].sort());
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(isTapped(game, isamaru)).toBe(true);
    expect(zone(game, kenrith)).toBe("graveyard");
  });

  it("triggers on Havi's own death, against Havi's mana value", () => {
    const { game, a } = table();
    const havi = spawn(game, "Havi, the All-Father");
    const kenrith = toGraveyard(game, "Kenrith, the Returned King");
    pickTargets(a, kenrith);
    destroy(game, havi);
    expect(zone(game, havi)).toBe("graveyard");
    expect(zone(game, kenrith)).toBe("battlefield");
    expect(isTapped(game, kenrith)).toBe(true);
  });

  it("doesn't trigger for a nonlegendary creature or an opponent's legendary creature", () => {
    const { game } = table();
    spawn(game, "Havi, the All-Father");
    const isamaru = toGraveyard(game, "Isamaru, Hound of Konda");
    destroy(game, spawn(game, "Hill Giant"));
    destroy(game, spawn(game, "Kenrith, the Returned King", B));
    expect(zone(game, isamaru)).toBe("graveyard");
  });
});

describe("Eivor, Battle-Ready", () => {
  it("deals damage equal to the number of Equipment you control to each opponent as it attacks", () => {
    const { game, a } = table({ players: 3 });
    const eivor = spawn(game, "Eivor, Battle-Ready");
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter", B);
    attack(game, a, [eivor]);
    expect(life(game, C)).toBe(20 - 2);
    expect(life(game, B)).toBe(20 - 2 - 5);
    expect(life(game, A)).toBe(20);
    // Vigilance.
    expect(isTapped(game, eivor)).toBe(false);
  });
});

describe("Cleopatra, Exiled Pharaoh", () => {
  it("puts a +1/+1 counter on each of up to two other target legendary creatures at your end step", () => {
    const { game, a } = table();
    const cleo = spawn(game, "Cleopatra, Exiled Pharaoh");
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    const kenrith = spawn(game, "Kenrith, the Returned King", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [thalia, kenrith]);
    toStep(game, "end");
    settle(game);
    expect(seen.offered[0]).toContain(thalia);
    expect(seen.offered[0]).toContain(kenrith);
    expect(seen.offered[0]).not.toContain(cleo);
    expect(seen.offered[0]).not.toContain(bears);
    expect(counters(game, thalia)).toBe(1);
    expect(counters(game, kenrith)).toBe(1);
    expect(counters(game, cleo)).toBe(0);
  });

  it("draws a card for each counter on a legendary creature that dies, and you lose only 2 life", () => {
    const { game } = table();
    spawn(game, "Cleopatra, Exiled Pharaoh");
    const kenrith = spawn(game, "Kenrith, the Returned King", B);
    game.state.objects[kenrith].counters["+1/+1"] = 2;
    game.state.objects[kenrith].counters["-1/-1"] = 1;
    const before = hand(game).length;
    destroy(game, kenrith, A);
    expect(hand(game).length).toBe(before + 3);
    expect(life(game, A)).toBe(18);
  });

  it("does nothing for a legendary creature without counters, or a nonlegendary one with them", () => {
    const { game } = table();
    spawn(game, "Cleopatra, Exiled Pharaoh");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const before = hand(game).length;
    destroy(game, spawn(game, "Thalia, Guardian of Thraben"));
    destroy(game, bears);
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(20);
  });
});

describe("Bleeding Effect", () => {
  it("gives your creatures each listed keyword a creature card in your graveyard has, until end of turn", () => {
    const { game } = table();
    spawn(game, "Bleeding Effect");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    toGraveyard(game, "Serra Angel");
    toGraveyard(game, "Typhoid Rats");
    // A creature card in an opponent's graveyard doesn't count.
    toGraveyard(game, "Thalia, Guardian of Thraben", B);
    toStep(game, "begin-combat");
    settle(game);
    const kw = keywords(game, bears);
    expect(kw.has("flying")).toBe(true);
    expect(kw.has("vigilance")).toBe(true);
    expect(kw.has("deathtouch")).toBe(true);
    expect(kw.has("first-strike")).toBe(false);
    expect(kw.has("trample")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    // Fixed as it resolved: a creature arriving later gains nothing.
    const later = spawn(game, "Grizzly Bears");
    expect(keywords(game, later).has("flying")).toBe(false);
    toStep(game, "end");
    settle(game);
    toStep(game, "precombat-main", B);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Haytham Kenway", () => {
  it("has protection from Assassins, and other Knights you control get +2/+2 and have it too", () => {
    const { game, a } = table();
    const haytham = spawn(game, "Haytham Kenway");
    const knight = spawn(game, "White Knight");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, haytham)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const spy = spawn(game, "Brotherhood Spy", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [haytham, knight, bears]);
    expect(canBlock(offer, spy)).toEqual([bears]);
    expect([...canBlock(offer, giant)].sort()).toEqual([haytham, knight, bears].sort());
  });

  it("exiles up to one target creature each opponent controls until it leaves the battlefield", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const carolsOther = spawn(game, "Typhoid Rats", C);
    const seen = watchTargets(a, (o) => [bobs, carols].slice(0, o.length));
    const haytham = enter(game, "Haytham Kenway");
    // One slot per opponent: bob's creatures, then carol's.
    expect(seen.offered[0]).toEqual([bobs]);
    expect([...seen.offered[1]].sort()).toEqual([carols, carolsOther].sort());
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    expect(zone(game, carolsOther)).toBe("battlefield");
    destroy(game, haytham);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(zone(game, carols)).toBe("battlefield");
    expect(game.state.objects[carols].controller).toBe(C);
  });
});

describe("Phantom Blade", () => {
  it("attaches to up to one creature you control and destroys up to one other creature as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    const blade = enter(game, "Phantom Blade");
    expect(attachedTo(game, blade)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can destroy without attaching", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, null, giant);
    const blade = enter(game, "Phantom Blade");
    expect(attachedTo(game, blade)).toBeNull();
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Brotherhood Spy", () => {
  it("gets +1/+0 and can't be blocked this turn at your beginning of combat if you control a legendary Assassin", () => {
    const { game } = table();
    const spy = spawn(game, "Brotherhood Spy");
    spawn(game, "Aveline de Grandpré");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, spy)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, spy).has("unblockable")).toBe(true);
  });

  it("does nothing without a legendary Assassin", () => {
    const { game } = table();
    const spy = spawn(game, "Brotherhood Spy");
    // A legendary non-Assassin and a nonlegendary Assassin don't count.
    spawn(game, "Thalia, Guardian of Thraben");
    spawn(game, "Brotherhood Spy");
    spawn(game, "Aveline de Grandpré", B);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, spy)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, spy).has("unblockable")).toBe(false);
  });
});

describe("Hidden Footblade", () => {
  it("attaches to target creature you control as it enters, which gains first strike this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const blade = toHand(game, "Hidden Footblade");
    pickTargets(a, bears);
    cast(game, blade);
    expect(attachedTo(game, blade)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("has flash", () => {
    const { game, a } = table({ step: "begin-combat" });
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const blade = toHand(game, "Hidden Footblade");
    pickTargets(a, bears);
    cast(game, blade);
    expect(attachedTo(game, blade)).toBe(bears);
    expect(graveyard(game).length).toBe(0);
  });
});
