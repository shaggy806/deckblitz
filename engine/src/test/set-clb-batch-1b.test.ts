/**
 * Commander Legends: Battle for Baldur's Gate, group b. One test (or two) per
 * card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
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

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Greatsword of Tyr", () => {
  it("puts a +1/+1 counter on the attacker and taps up to one creature the defending player controls", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Greatsword of Tyr");
    lands(game, "Plains", 1);
    activate(game, sword, 0, { targets: [ref(bears)] });
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [second]);
    attack(game, a, [bears]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([first, second]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[second].tapped).toBe(true);
    expect(game.state.objects[first].tapped).toBe(false);
  });

  it("still puts the counter on when no creature is tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Greatsword of Tyr");
    lands(game, "Plains", 1);
    activate(game, sword, 0, { targets: [ref(bears)] });
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[theirs].tapped).toBe(false);
  });
});

describe("Feywild Visitor", () => {
  it("gives a commander you own one Faerie Dragon per player dealt combat damage by nontoken creatures", () => {
    const { game, a } = table();
    spawn(game, "Feywild Visitor");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [commander, other]);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(1);
  });

  it("doesn't trigger off a token's damage, nor without a commander", () => {
    const { game, a } = table();
    spawn(game, "Feywild Visitor");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const token = spawn(game, "Faerie Dragon Token");
    attack(game, a, [token]);
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(1);

    const other = table();
    spawn(other.game, "Feywild Visitor");
    const bears = spawn(other.game, "Grizzly Bears");
    attack(other.game, other.a, [bears]);
    expect(tokensNamed(other.game, "Faerie Dragon Token", A)).toBe(0);
  });
});

describe("Zhentarim Bandit", () => {
  it("pays 1 life for a Treasure as it attacks", () => {
    const { game, a } = table();
    const bandit = spawn(game, "Zhentarim Bandit");
    pickModes(a, 0);
    attack(game, a, [bandit]);
    expect(life(game, A)).toBe(19);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("declining pays nothing and makes nothing", () => {
    const { game, a } = table();
    const bandit = spawn(game, "Zhentarim Bandit");
    pickModes(a);
    attack(game, a, [bandit]);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Goggles of Night", () => {
  it("scries 1, then draws, when the equipped creature deals combat damage to a player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const goggles = spawn(game, "Goggles of Night");
    lands(game, "Wastes", 2);
    activate(game, goggles, 0, { targets: [ref(bears)] });
    const top = toLibrary(game, "Island");
    const handBefore = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(handBefore + 1);
    // Kept on top by the scry, then drawn.
    expect(zone(game, top)).toBe("hand");
  });
});

describe("Fang Dragon // Forktail Sweep", () => {
  it("the Adventure deals 1 damage to each creature you don't control, then the Dragon is castable from exile", () => {
    const { game } = table();
    const mine = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Llanowar Elves", B);
    const bigger = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Fang Dragon");
    lands(game, "Mountain", 2);
    cast(game, card, { face: 1 });
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, bigger)).toBe("battlefield");
    expect(zone(game, card)).toBe("exile");
    lands(game, "Mountain", 7);
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");
    expect(pt(game, card)).toEqual({ power: 6, toughness: 3 });
  });
});

describe("Colossal Badger // Dig Deep", () => {
  it("Dig Deep mills four and counts only the creature cards milled", () => {
    const { game } = table();
    const target = spawn(game, "Grizzly Bears");
    toLibrary(game, "Island");
    toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Island");
    toLibrary(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears"); // already there: not milled this way
    const card = toHand(game, "Colossal Badger");
    lands(game, "Forest", 2);
    cast(game, card, { face: 1, targets: [ref(target)] });
    expect(counters(game, target)).toBe(2);
    expect(zone(game, card)).toBe("exile");
  });

  it("the Badger gains 3 life as it enters", () => {
    const { game } = table();
    enter(game, "Colossal Badger");
    expect(life(game, A)).toBe(23);
  });
});

describe("Summon Undead", () => {
  it("may mill three, then returns a creature card of your choice to the battlefield", () => {
    const { game, a } = table();
    const old = toGraveyard(game, "Grizzly Bears");
    toLibrary(game, "Island");
    const milled = toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Island");
    pickModes(a, 0);
    const seen = pickFromZone(a, milled);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Summon Undead"));
    expect(seen.offered).toEqual(expect.arrayContaining([old, milled]));
    expect(zone(game, milled)).toBe("battlefield");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("can't mill with fewer than three cards in the library, and still returns a creature (the rulings)", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: library(game).length }, []);
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(library(game).length).toBe(2);
    pickModes(a, 0);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Summon Undead"));
    expect(library(game).length).toBe(2);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Arms of Hadar", () => {
  it("gives only the target player's creatures -2/-2", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Arms of Hadar"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, big)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Amber Gristle O'Maul", () => {
  it("discards the hand and draws one card per player being attacked", () => {
    const { game, a } = table({ players: 3 });
    const amber = spawn(game, "Amber Gristle O'Maul");
    const bears = spawn(game, "Grizzly Bears");
    const kept = [toHand(game, "Island"), toHand(game, "Island"), toHand(game, "Island")];
    const handBefore = hand(game).length;
    pickModes(a, 0);
    a.declareAttackersFn = () => [
      { attacker: amber, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main");
    for (const card of kept) expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(2);
    expect(graveyard(game).length).toBe(handBefore);
  });

  it("may discard an empty hand (the ruling), drawing for the one player attacked", () => {
    const { game, a } = table();
    const amber = spawn(game, "Amber Gristle O'Maul");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    expect(hand(game).length).toBe(0);
    pickModes(a, 0);
    attack(game, a, [amber]);
    expect(hand(game).length).toBe(1);
  });
});
