/**
 * Set walk batch 82, part a (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

/** Every card in `player`'s graveyard leaves it, at once. */
const emptyGraveyard = (game: Game, player = A): void => {
  game.debugApplyEffect(player, { kind: "exile-graveyard", target: "you" });
  settle(game);
};

describe("Mog, Moogle Warrior", () => {
  it("each player may discard to draw; a creature discarded makes a Moogle, a noncreature one grows each Moogle", () => {
    const { game, a, b } = table();
    const mog = spawn(game, "Mog, Moogle Warrior");
    const bears = toHand(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt", B);
    pickModes(a, 0);
    pickModes(b, 0);
    a.chooseDiscardsFn = () => [bears];
    b.chooseDiscardsFn = () => [bolt];
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game)).toHaveLength(mine);
    expect(hand(game, B)).toHaveLength(theirs);
    expect(tokensNamed(game, "Moogle Token", A)).toBe(1);
    expect(tokensNamed(game, "Moogle Token", B)).toBe(0);
    // The counters come after the token: it gets one too.
    expect(counters(game, mog)).toBe(1);
    expect(counters(game, named(game, "Moogle Token", A)[0])).toBe(1);
    expect(pt(game, mog)).toEqual({ power: 2, toughness: 3 });
  });

  it("a player who declines draws nothing; only creature cards discarded: a Moogle and no counters", () => {
    const { game, a, b } = table();
    const mog = spawn(game, "Mog, Moogle Warrior");
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    pickModes(b);
    a.chooseDiscardsFn = () => [bears];
    const theirs = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B)).toHaveLength(theirs);
    expect(tokensNamed(game, "Moogle Token", A)).toBe(1);
    expect(counters(game, mog)).toBe(0);
  });
});

describe("Siegfried, Famed Swordsman", () => {
  it("mills three, then gets twice the creature cards in your graveyard in +1/+1 counters", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Hill Giant", B);
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    const siegfried = enter(game, "Siegfried, Famed Swordsman");
    // One creature card there before, two milled: X is 6.
    expect(counters(game, siegfried)).toBe(6);
    expect(pt(game, siegfried)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, siegfried).has("menace")).toBe(true);
  });
});

describe("Barret, Avalanche Leader", () => {
  it("makes a 2/2 Rebel whenever an Equipment you control enters — not an opponent's", () => {
    const { game } = table();
    spawn(game, "Barret, Avalanche Leader");
    enter(game, "Bonesplitter");
    expect(tokensNamed(game, "Rebel Token", A)).toBe(1);
    enter(game, "Bonesplitter", B);
    expect(tokensNamed(game, "Rebel Token")).toBe(1);
  });

  it("attaches up to one Equipment you control to a Rebel you control as combat begins", () => {
    const { game, a } = table();
    const barret = spawn(game, "Barret, Avalanche Leader");
    const splitter = spawn(game, "Bonesplitter");
    spawn(game, "Grizzly Bears");
    spawn(game, "Bonesplitter", B);
    const seen = watchTargets(a, () => [splitter, barret]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered[0]).toEqual([splitter]);
    expect(seen.offered[1]).toEqual([barret]);
    expect(game.state.objects[splitter].attachedTo).toBe(barret);
    expect(pt(game, barret)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Hraesvelgr of the First Brood", () => {
  it("as it enters and whenever you cast a noncreature spell: target creature gets +1/+0 and can't be blocked", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    const dragon = enter(game, "Hraesvelgr of the First Brood");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, dragon).has("vigilance")).toBe(true);
    lands(game, "Mountain", 1);
    pickTargets(a, giant);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, giant).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, giant).has("unblockable")).toBe(false);
  });
});

describe("Gau, Feral Youth", () => {
  it("gets a +1/+1 counter as it attacks; no card left your graveyard, so no end-step damage", () => {
    const { game, a } = table();
    const gau = spawn(game, "Gau, Feral Youth");
    toGraveyard(game, "Grizzly Bears");
    attack(game, a, [gau]);
    expect(counters(game, gau)).toBe(1);
    expect(life(game, B)).toBe(17);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("deals damage equal to its power to each opponent at an end step once a card left your graveyard", () => {
    const { game } = table({ players: 3 });
    const gau = spawn(game, "Gau, Feral Youth");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(gau)]);
    toGraveyard(game, "Grizzly Bears");
    emptyGraveyard(game);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("General Leo Cristophe", () => {
  it("returns a creature card with mana value 3 or less, then gets a counter per creature you control", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const leo = enter(game, "General Leo Cristophe");
    expect(seen.offered[0]).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    // Leo, the bears there before and the bears returned.
    expect(counters(game, leo)).toBe(3);
  });

  it("with no target chosen, still puts the counters on", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, null);
    const leo = enter(game, "General Leo Cristophe");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, leo)).toBe(1);
  });

  it("does nothing at all if its target is gone as it resolves", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const leo = enter(game, "General Leo Cristophe", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, leo)).toBe(0);
  });
});

describe("Brilliant Wings", () => {
  it("gives flying and hexproof, and may move onto a creature you control that enters for {1}", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const wings = toHand(game, "Brilliant Wings");
    cast(game, wings, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    pickModes(a, 0);
    const giant = enter(game, "Hill Giant");
    expect(game.state.objects[wings].attachedTo).toBe(giant);
    expect(keywords(game, giant).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("stays put when you decline, and never moves to an opponent's creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const wings = toHand(game, "Brilliant Wings");
    cast(game, wings, { targets: [ref(bears)] });
    pickModes(a);
    enter(game, "Hill Giant");
    expect(game.state.objects[wings].attachedTo).toBe(bears);
    pickModes(a, 0);
    enter(game, "Hill Giant", B);
    expect(game.state.objects[wings].attachedTo).toBe(bears);
  });
});

describe("Yuna's Whistle", () => {
  it("finds a creature card for your hand, then puts its mana value in counters on a creature you control", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    pickTargets(a, bears);
    const onTop = game.state.zones.perPlayer[A].library.indexOf(forest);
    cast(game, toHand(game, "Yuna's Whistle"));
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, forest)).toBe("library");
    // The Forest revealed on the way goes to the other end: the bottom.
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(forest)).toBe(onTop === 0 ? library.length - 1 : 0);
    expect(counters(game, bears)).toBe(4);
  });
});

describe("Summoner's Sending", () => {
  it("exiles a creature card from any graveyard for a Spirit, with a counter for mana value 4 or more", () => {
    const { game, a } = table();
    spawn(game, "Summoner's Sending");
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    const spirits = named(game, "Spirit Token", A);
    expect(spirits).toHaveLength(1);
    expect(counters(game, spirits[0])).toBe(1);
    expect(pt(game, spirits[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("a cheaper creature card makes a plain Spirit; declining makes none", () => {
    const { game, a } = table();
    spawn(game, "Summoner's Sending");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    const spirits = named(game, "Spirit Token", A);
    expect(spirits).toHaveLength(1);
    expect(counters(game, spirits[0])).toBe(0);

    const giant = toGraveyard(game, "Hill Giant");
    pickTargets(a, giant);
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("The Falcon, Airship Restored", () => {
  it("may be sacrificed after combat damage to a player; when it is, returns a creature card", () => {
    const { game, a } = table();
    const falcon = spawn(game, "The Falcon, Airship Restored");
    const giant = toGraveyard(game, "Hill Giant");
    crewed(game, falcon);
    pickModes(a, 0);
    pickTargets(a, giant);
    attack(game, a, [falcon]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, falcon)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("stays when you decline, and returns itself from the graveyard tapped for {4}{B}", () => {
    const { game, a } = table();
    const falcon = spawn(game, "The Falcon, Airship Restored");
    toGraveyard(game, "Hill Giant");
    crewed(game, falcon);
    pickModes(a);
    attack(game, a, [falcon]);
    expect(zone(game, falcon)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(falcon)]);
    settle(game);
    expect(zone(game, falcon)).toBe("graveyard");
    lands(game, "Swamp", 5);
    activate(game, falcon, 0);
    expect(zone(game, falcon)).toBe("battlefield");
    expect(game.state.objects[falcon].tapped).toBe(true);
  });
});

describe("Fishing Gear", () => {
  it("exiles the damaged player's top card and may put a permanent card onto the battlefield under your control", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const gear = spawn(game, "Fishing Gear");
    activate(game, gear, 0, { targets: [ref(bears)] });
    expect(game.state.objects[gear].attachedTo).toBe(bears);
    const giant = toLibrary(game, "Hill Giant", B);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(tokensNamed(game, "Fish Token")).toBe(0);
  });

  it("makes a Fish when the card isn't a permanent card, or when you leave it in exile", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const gear = spawn(game, "Fishing Gear");
    activate(game, gear, 0, { targets: [ref(bears)] });
    const bolt = toLibrary(game, "Lightning Bolt", B);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, bolt)).toBe("exile");
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);

    nextTurn(game);
    nextTurn(game);
    const giant = toLibrary(game, "Hill Giant", B);
    pickModes(a);
    attack(game, a, [bears]);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Fish Token", A)).toBe(2);
  });
});

describe("Cyan, Vengeful Samurai", () => {
  it("costs {1} less for each creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Hill Giant", B);
    const cyan = toHand(game, "Cyan, Vengeful Samurai");
    cast(game, cyan);
    expect(zone(game, cyan)).toBe("battlefield");
    expect(keywords(game, cyan).has("double-strike")).toBe(true);
  });

  it("gets one counter when one or more creature cards leave your graveyard at once", () => {
    const { game } = table();
    const cyan = spawn(game, "Cyan, Vengeful Samurai");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    emptyGraveyard(game);
    expect(counters(game, cyan)).toBe(1);
    toGraveyard(game, "Lightning Bolt");
    emptyGraveyard(game);
    expect(counters(game, cyan)).toBe(1);
    toGraveyard(game, "Grizzly Bears", B);
    emptyGraveyard(game, B);
    expect(counters(game, cyan)).toBe(1);
  });
});

describe("Interceptor, Shadow's Hound", () => {
  it("gives Assassins you control menace", () => {
    const { game } = table();
    spawn(game, "Interceptor, Shadow's Hound");
    const assassin = spawn(game, "Assassin Initiate");
    const theirs = spawn(game, "Assassin Initiate", B);
    expect(keywords(game, assassin).has("menace")).toBe(true);
    expect(keywords(game, theirs).has("menace")).toBe(false);
  });

  it("may pay {2}{B} to return from your graveyard tapped and attacking when you attack with a legendary creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const dog = toGraveyard(game, "Interceptor, Shadow's Hound");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    pickModes(a, 0);
    attack(game, a, [isamaru]);
    expect(zone(game, dog)).toBe("battlefield");
    expect(game.state.objects[dog].tapped).toBe(true);
    expect(life(game, B)).toBe(14);
  });

  it("doesn't trigger for an attack with no legendary creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const dog = toGraveyard(game, "Interceptor, Shadow's Hound");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, dog)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
