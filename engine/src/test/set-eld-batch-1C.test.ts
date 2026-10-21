/**
 * Throne of Eldraine, group C (and a few earlier "doesn't untap" Auras): the
 * clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Mystical Dispute", () => {
  it("costs only {U} against a blue spell, and counters it unless {3} is paid", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const looter = toHand(game, "Merfolk Looter");
    cast(game, looter, { settle: false });
    // One Island left: only the reduced cost is payable.
    cast(game, toHand(game, "Mystical Dispute"), { targets: [ref(looter)] });
    expect(zone(game, looter)).toBe("graveyard");
  });

  it("costs {2}{U} against a non-blue spell", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const dispute = toHand(game, "Mystical Dispute");
    const at: Action = { type: "cast-spell", player: A, card: dispute, targets: [ref(bears)] };
    expect(game.canDispatch(at)).not.toBeNull();
  });
});

describe("Banish into Fable", () => {
  it("cast from hand with an artifact and an enchantment: copied twice, each copy retargeted", () => {
    const { game, a } = table();
    spawn(game, "Ornithopter");
    spawn(game, "Fortifying Provisions");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 4);
    const queue: ObjectId[] = [bears[1], bears[2]];
    a.chooseTargetsFn = () => [ref(queue.shift()!)];
    cast(game, toHand(game, "Banish into Fable"), { targets: [ref(bears[0])] });
    for (const b of bears) expect(zone(game, b)).toBe("hand");
    expect(tokensNamed(game, "Knight Token", A)).toBe(3);
  });

  it("with neither: no copy — one bounce, one Knight", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 4);
    cast(game, toHand(game, "Banish into Fable"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });
});

describe("Wandermare", () => {
  it("counts a creature spell that has an Adventure, not one cast as its Adventure", () => {
    const { game } = table();
    const mare = spawn(game, "Wandermare");
    const wastes = lands(game, "Plains", 4);
    cast(game, toHand(game, "Shepherd of the Flock"), { face: 1, targets: [ref(wastes[0])] });
    expect(counters(game, mare)).toBe(0);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Shepherd of the Flock"));
    expect(counters(game, mare)).toBe(1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, mare)).toBe(1);
  });
});

describe("Wicked Guardian", () => {
  it("may deal 2 damage to another creature you control; if it does, draw", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, bears);
    const before = hand(game).length;
    const guardian = enter(game, "Wicked Guardian");
    expect(seen.offered).not.toContain(guardian);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("choosing none: no damage, no card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    const before = hand(game).length;
    enter(game, "Wicked Guardian");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Skullknocker Ogre", () => {
  it("that player discards at random, then draws", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Skullknocker Ogre");
    const before = hand(game, B).length;
    const yard = graveyard(game, B).length;
    attack(game, a, [ogre]);
    expect(graveyard(game, B).length).toBe(yard + 1);
    expect(hand(game, B).length).toBe(before);
  });

  it("with no card to discard, no draw", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Skullknocker Ogre");
    game.debugApplyEffect(B, { kind: "discard-hand", who: "you" });
    expect(hand(game, B).length).toBe(0);
    attack(game, a, [ogre]);
    expect(hand(game, B).length).toBe(0);
  });
});

describe("Stunning Strike", () => {
  it("a nonlegendary creature stays tapped; a legendary one untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const isamaru = spawn(game, "Isamaru, Hound of Konda", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Stunning Strike"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Stunning Strike"), { targets: [ref(isamaru)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[isamaru].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[isamaru].tapped).toBe(false);
  });
});

describe("Weakstone's Subjugation", () => {
  it("enchants an artifact; paying {3} taps it, and it doesn't untap", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Weakstone's Subjugation"), { targets: [ref(ring)] });
    expect(game.state.objects[ring].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[ring].tapped).toBe(true);
  });

  it("declining the {3}: it isn't tapped", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 4);
    pickModes(a);
    cast(game, toHand(game, "Weakstone's Subjugation"), { targets: [ref(ring)] });
    expect(game.state.objects[ring].tapped).toBe(false);
  });
});

describe("Harmonious Archon", () => {
  it("non-Archon creatures, any player's, have base 3/3; it doesn't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const archon = enter(game, "Harmonious Archon");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, angel)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, archon)).toEqual({ power: 4, toughness: 5 });
    expect(tokensNamed(game, "Human Token", A)).toBe(2);
  });
});

describe("Belle of the Brawl and Inspiring Veteran", () => {
  it("attacking, Belle gives other Knights +1/+0; the Veteran gives other Knights +1/+1", () => {
    const { game, a } = table();
    const belle = spawn(game, "Belle of the Brawl");
    const veteran = spawn(game, "Inspiring Veteran");
    const knight = spawn(game, "Knight Token");
    expect(pt(game, belle)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, veteran)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [belle]);
    expect(pt(game, belle)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, veteran)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Bramblefort Fink", () => {
  it("activates only with an Oko planeswalker", () => {
    const { game } = table();
    const fink = spawn(game, "Bramblefort Fink");
    lands(game, "Forest", 8);
    const at: Action = { type: "activate-ability", player: A, source: fink, abilityIndex: 0, targets: [] };
    expect(game.canDispatch(at)).not.toBeNull();
    spawn(game, "Oko, Lorwyn Liege");
    activate(game, fink);
    expect(pt(game, fink)).toEqual({ power: 10, toughness: 10 });
  });
});

describe("Taste of Death", () => {
  it("each player sacrifices three creatures; three Food regardless", () => {
    const { game } = table();
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Taste of Death"));
    expect(mine.filter((id) => zone(game, id) === "battlefield").length).toBe(1);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B && game.state.objects[id].cardName === "Grizzly Bears").length).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });
});
