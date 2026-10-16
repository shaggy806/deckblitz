/**
 * Set walk batch 90, part d (2026-10-16): Fallout (PIP) and Ravnica: Clue Edition (CLU), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
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
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Any offer to cast or play `card` (from wherever it is). */
const offersFor = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);
const abilityOffers = (game: Game, source: ObjectId) =>
  game
    .legalActions(A)
    .filter(
      (x): x is Extract<LegalAction, { kind: "activate-ability" }> =>
        x.kind === "activate-ability" && x.source === source,
    );

describe("Senator Peacock", () => {
  it("makes your artifacts Clues with the Clue's ability, and a sacrificed Clue makes a creature unblockable", () => {
    const { game, a } = table();
    spawn(game, "Senator Peacock");
    const thopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    expect(subtypes(game, thopter)).toContain("Clue");
    expect(subtypes(game, theirs)).not.toContain("Clue");
    const draw = abilityOffers(game, thopter).find((o) => o.text.includes("Draw a card"));
    expect(draw).toBeDefined();
    pickTargets(a, bears);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: thopter, abilityIndex: draw!.abilityIndex });
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("a Clue token's own sacrifice triggers it too; an opponent's doesn't", () => {
    const { game, a, b } = table();
    spawn(game, "Senator Peacock");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Island", 2, B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Clue Token", count: 1 });
    const [theirClue] = named(game, "Clue Token", B);
    const [clue] = named(game, "Clue Token", A);
    pickTargets(a, bears);
    pickTargets(b, bears);
    // Bob's Clue first, on his own priority: no trigger for Alice.
    game.dispatch({ type: "pass-priority", player: A });
    const theirOffer = game
      .legalActions(B)
      .find((o) => o.kind === "activate-ability" && o.source === theirClue);
    expect(theirOffer).toBeDefined();
    activate(game, theirClue, 0, { player: B });
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    toStep(game, "postcombat-main");
    activate(game, clue, 0);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Corporeal Projection", () => {
  it("gives target creature you control myriad until end of turn", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Corporeal Projection"), { targets: [ref(bears)] });
    pickModes(a, 0);
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(18);
    // The token copy attacked carol, and was exiled at end of combat.
    expect(life(game, C)).toBe(18);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
  });

  it("overloaded, every creature you control gains it, with no target", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const ox = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    lands(game, "Mountain", 3);
    const spell = toHand(game, "Corporeal Projection");
    const overloaded = game
      .legalActions(A)
      .find((o) => o.kind === "cast-spell" && o.card === spell && o.overload === true);
    expect(overloaded).toBeDefined();
    cast(game, spell, { overload: true });
    pickModes(a, 0);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: ox, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(16);
  });
});

describe("Sumala Rumblers", () => {
  it("has power equal to the number of creatures you control, and myriad", () => {
    const { game, a } = table({ players: 3 });
    const wurm = spawn(game, "Sumala Rumblers");
    expect(pt(game, wurm)).toEqual({ power: 1, toughness: 4 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, wurm)).toEqual({ power: 2, toughness: 4 });
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    // The copy is a third creature: each Wurm is a 3/4 now.
    const wurms = named(game, "Sumala Rumblers");
    expect(wurms).toHaveLength(2);
    const copy = wurms.find((id) => id !== wurm)!;
    expect(game.state.objects[copy].attacking).toBe(C);
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 4 });
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });
});

describe("Stampede Surfer", () => {
  it("makes a tapped Boar attacking each opponent, all entering at once", () => {
    const { game, a } = table({ players: 3 });
    const surfer = spawn(game, "Stampede Surfer");
    spawn(game, "Marneus Calgar");
    a.declareAttackersFn = () => [{ attacker: surfer, defender: B }];
    const before = hand(game).length;
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    const boars = named(game, "Boar Token");
    expect(boars.map((id) => game.state.objects[id].attacking).sort()).toEqual([B, C].sort());
    expect(boars.every((id) => game.state.objects[id].tapped)).toBe(true);
    // "Whenever one or more tokens you control enter": one entry, one card.
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20 - 4 - 2);
    expect(life(game, C)).toBe(18);
  });
});

describe("Syndicate Heavy", () => {
  it("investigates at the end step once you've gained 4 or more life this turn", () => {
    const { game } = table();
    spawn(game, "Syndicate Heavy");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    game.debugApplyEffect(A, { kind: "lose-life", amount: 5 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("doesn't with only 3 life gained, and extort pays {W/B} for a drain", () => {
    const { game, a } = table();
    spawn(game, "Syndicate Heavy");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Boros Strike-Captain", () => {
  it("exiles the top card when it and two others attack; playable that turn", () => {
    const { game, a } = table();
    const captain = spawn(game, "Boros Strike-Captain");
    const others = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [captain, ...others]);
    expect(zone(game, top)).toBe("exile");
    lands(game, "Forest", 2);
    expect(offersFor(game, top).length).toBeGreaterThan(0);
  });

  it("does nothing with only one other attacker", () => {
    const { game, a } = table();
    const captain = spawn(game, "Boros Strike-Captain");
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [captain, bears]);
    expect(zone(game, top)).toBe("library");
  });

  it("a later turn needs three attackers again, even after the Captain is gone", () => {
    const { game, a } = table();
    const captain = spawn(game, "Boros Strike-Captain");
    const others = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [captain, ...others]);
    expect(zone(game, top)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(captain)]);
    settle(game);
    lands(game, "Forest", 2);
    // Alice's next turn: not attacked with three yet.
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(offersFor(game, top)).toHaveLength(0);
    const third = spawn(game, "Grizzly Bears");
    attack(game, a, [...others, third]);
    expect(offersFor(game, top).length).toBeGreaterThan(0);
  });
});

describe("Unruly Krasis", () => {
  it("may set another creature's base P/T to its power, with counters on top", () => {
    const { game, a } = table();
    const krasis = spawn(game, "Unruly Krasis");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: krasis, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, bears)).toContain("Bear");
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("declined, nothing changes; adapt puts three counters on only once", () => {
    const { game, a } = table();
    const krasis = spawn(game, "Unruly Krasis");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 10);
    lands(game, "Island", 10);
    activate(game, krasis, 0);
    expect(counters(game, krasis)).toBe(3);
    activate(game, krasis, 0);
    expect(counters(game, krasis)).toBe(3);
    pickModes(a);
    attack(game, a, [krasis]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("X is its power as the trigger resolves", () => {
    const { game, a } = table();
    const krasis = spawn(game, "Unruly Krasis");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(krasis)]);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: krasis, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Tribune of Rot", () => {
  it("mills two and makes a Saproling for each creature card milled", () => {
    const { game, a } = table();
    const tribune = spawn(game, "Tribune of Rot");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    attack(game, a, [tribune]);
    expect(graveyard(game).length).toBe(2);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(1);
  });

  it("two creature cards, two Saprolings", () => {
    const { game, a } = table();
    const tribune = spawn(game, "Tribune of Rot");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Serra Angel");
    attack(game, a, [tribune]);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);
  });
});

describe("Carnage Interpreter", () => {
  it("discards your hand and investigates four times; big and menacing on one or fewer cards", () => {
    const { game } = table();
    expect(hand(game).length).toBeGreaterThan(1);
    const devil = enter(game, "Carnage Interpreter");
    expect(hand(game)).toHaveLength(0);
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
    expect(pt(game, devil)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, devil).has("menace")).toBe(true);
    toHand(game, "Wastes");
    expect(pt(game, devil)).toEqual({ power: 5, toughness: 5 });
    toHand(game, "Wastes");
    expect(pt(game, devil)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, devil).has("menace")).toBe(false);
  });
});

describe("Ordruun Mentor", () => {
  it("mentors a smaller attacker, and gives a creature attacking each player first strike", () => {
    const { game, a } = table({ players: 3 });
    const mentor = spawn(game, "Ordruun Mentor");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: mentor, defender: B },
      { attacker: bears, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(1);
    // One trigger per player attacked, each only able to target the creature attacking that player.
    expect(keywords(game, mentor).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });

  it("can't mentor a creature with equal power", () => {
    const { game, a } = table();
    const mentor = spawn(game, "Ordruun Mentor");
    const other = spawn(game, "Ordruun Mentor");
    pickTargets(a, other);
    a.declareAttackersFn = () => [
      { attacker: mentor, defender: B },
      { attacker: other, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, mentor)).toBe(0);
    expect(counters(game, other)).toBe(0);
    expect(keywords(game, other).has("first-strike")).toBe(true);
  });
});

describe("Furious Spinesplitter", () => {
  it("gets a counter at your end step for each opponent dealt damage this turn", () => {
    const { game, a } = table({ players: 3 });
    const ogre = spawn(game, "Furious Spinesplitter");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(C)] });
    attack(game, a, [ogre], B);
    toStep(game, "end");
    settle(game);
    expect(counters(game, ogre)).toBe(2);
  });

  it("no damage, no counter", () => {
    const { game } = table({ players: 3 });
    const ogre = spawn(game, "Furious Spinesplitter");
    toStep(game, "end");
    settle(game);
    expect(counters(game, ogre)).toBe(0);
  });
});

describe("Undercover Butler", () => {
  it("can't be blocked attacking the player with the most life (tied counts), only then", () => {
    const { game, a } = table({ players: 3 });
    const butler = spawn(game, "Undercover Butler");
    game.debugApplyEffect(C, { kind: "lose-life", amount: 5 });
    attack(game, a, [butler], B);
    // Bob is tied with alice for the most.
    expect(keywords(game, butler).has("unblockable")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(4);
    attack(game, a, [butler], C);
    expect(keywords(game, butler).has("unblockable")).toBe(false);
  });

  it("doesn't trigger when you alone have the most life", () => {
    const { game, a } = table();
    const butler = spawn(game, "Undercover Butler");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    attack(game, a, [butler], B);
    expect(keywords(game, butler).has("unblockable")).toBe(false);
  });
});
