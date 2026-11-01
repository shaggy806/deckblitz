/**
 * The `turn-face-up` effect: a face-down permanent turned face up by a spell
 * or ability, nothing paid (rule 708.7), the same permanent (708.8).
 *
 * What each test pins down:
 *
 * - Ixidor, Reality Sculptor: +1/+1 on every player's face-down creature, its
 *   ability offered only face-down creatures and turning one up for free;
 * - however it came to be face down: manifested, cloaked, or turned face down
 *   by an effect with no cost that could turn it up (708.2a);
 * - a land manifested is a land again;
 * - the card's own "when this is turned face up" triggers; a megamorph gets no
 *   counter (702.37b), an "as this is turned face up" does (Hooded Hydra);
 * - Break Open: only an opponent's; its controller turns it, as the event says;
 * - Skirk Alarmist: turned up, then sacrificed at the next end step;
 * - Showstopping Surprise: its power as it is after turning up, and a face-up
 *   target just deals the damage;
 * - an instant or sorcery card is revealed, stays face down, and nothing
 *   triggers (701.40g, 701.58g);
 * - `cant-turn-face-up` stops the effect too (Unable to Scream), and Karlov
 *   Watchdog stops both ways during your turn, for your opponents' only;
 * - "you may turn a face-down creature you control face up" is a
 *   `choose-permanents` over it.
 */

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  hand,
  lands,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

/** `name` manifested from the top of `player`'s library, or cloaked. */
function faceDown(game: Game, name: string, player: PlayerId = A, cloak = false): ObjectId {
  const card = toLibrary(game, name, player);
  game.debugApplyEffect(player, { kind: "manifest", who: "you", ...(cloak ? { cloak: true } : {}) });
  settle(game);
  expect(game.state.objects[card].faceDown).toBeDefined();
  return card;
}

const turnUp = (game: Game, id: ObjectId): void => {
  const effect: EffectSpec = { kind: "turn-face-up", target: 0 };
  game.debugApplyEffect(A, effect, [ref(id)]);
  settle(game);
};

const turnedUpEvents = (game: Game, id: ObjectId): number =>
  game.state.eventLog.filter((e) => e.type === "permanent-turned-face-up" && e.object === id).length;

describe("Ixidor, Reality Sculptor", () => {
  it("pumps every player's face-down creature, and not a face-up one", () => {
    const { game } = table();
    spawn(game, "Ixidor, Reality Sculptor");
    const mine = faceDown(game, "Grizzly Bears");
    const theirs = faceDown(game, "Hill Giant", B);
    const bears = spawn(game, "Llanowar Elves");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("offers only face-down creatures and turns one up with nothing but its own cost paid", () => {
    const { game } = table();
    const ixidor = spawn(game, "Ixidor, Reality Sculptor");
    const theirs = faceDown(game, "Hill Giant", B);
    const faceUp = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    expect(mayTarget(game, ixidor, faceUp)).toBe(false);
    expect(mayTarget(game, ixidor, theirs)).toBe(true);
    activate(game, ixidor, 0, { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].faceDown).toBeUndefined();
    // Its own 3/3, not boosted any more; the same permanent, still Bob's.
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
    expect(controller(game, theirs)).toBe(B);
    expect(turnedUpEvents(game, theirs)).toBe(1);
  });
});

/** Whether `source`'s ability may be activated at `target`. */
function mayTarget(game: Game, source: ObjectId, target: ObjectId): boolean {
  const action: Action = {
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: 0,
    targets: [ref(target)],
  } as Action;
  return game.canDispatch(action) === null;
}

describe("however it came to be face down", () => {
  it("turns up a cloaked permanent, and it loses ward", () => {
    const { game } = table();
    const cloaked = faceDown(game, "Grizzly Bears", A, true);
    expect(game.state.objects[cloaked].faceDown).toEqual({ kind: "cloak" });
    turnUp(game, cloaked);
    expect(game.state.objects[cloaked].faceDown).toBeUndefined();
    expect(game.characteristics(cloaked).keywords).not.toContain("ward");
  });

  it("turns up a permanent an effect turned face down, which no cost could", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[bears].faceDown).toEqual({ kind: "effect" });
    expect(game.legalActions(A).some((a) => a.kind === "turn-face-up" && a.permanent === bears)).toBe(false);
    turnUp(game, bears);
    expect(game.state.objects[bears].faceDown).toBeUndefined();
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("makes a manifested land a land again, no creature", () => {
    const { game } = table();
    const land = faceDown(game, "Forest");
    expect(types(game, land)).toContain("creature");
    turnUp(game, land);
    expect(types(game, land)).toEqual(["land"]);
  });

  it("does nothing to a permanent that isn't face down", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    turnUp(game, bears);
    expect(turnedUpEvents(game, bears)).toBe(0);
  });
});

describe("what turning up by an effect triggers and gives", () => {
  it("fires the card's own trigger, and gives a megamorph no counter", () => {
    const { game, a } = table();
    // Den Protector: megamorph; "when this creature is turned face up, return
    // target card from your graveyard to your hand".
    const inYard = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(inYard)]);
    settle(game);
    const protector = faceDown(game, "Den Protector");
    pickTargets(a, inYard);
    turnUp(game, protector);
    expect(counters(game, protector)).toBe(0);
    expect(hand(game)).toContain(inYard);
  });

  it("still gives Hooded Hydra its five counters", () => {
    const { game } = table();
    const hydra = faceDown(game, "Hooded Hydra");
    turnUp(game, hydra);
    expect(counters(game, hydra)).toBe(5);
  });
});

describe("Break Open", () => {
  it("turns up an opponent's face-down creature, and may not target your own", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mine = faceDown(game, "Grizzly Bears");
    const theirs = faceDown(game, "Hill Giant", B);
    const spell = toHand(game, "Break Open");
    expect(() => cast(game, spell, { targets: [ref(mine)] })).toThrow();

    cast(game, spell, { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].faceDown).toBeUndefined();
    const event = game.state.eventLog.find((e) => e.type === "permanent-turned-face-up" && e.object === theirs);
    expect(event).toMatchObject({ player: B });
    expect(game.state.objects[mine].faceDown).toBeDefined();
  });
});

describe("Skirk Alarmist", () => {
  it("turns up your face-down creature, then sacrifices it at the next end step", () => {
    const { game } = table();
    const skirk = spawn(game, "Skirk Alarmist");
    const giant = faceDown(game, "Hill Giant");
    activate(game, skirk, 0, { targets: [ref(giant)] });
    expect(game.state.objects[giant].faceDown).toBeUndefined();
    expect(zone(game, giant)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[skirk].tapped).toBe(true);
  });
});

describe("Showstopping Surprise", () => {
  it("deals its power after turning up, to each other creature", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = faceDown(game, "Hill Giant");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Wall of Wood", B);
    const spell = toHand(game, "Showstopping Surprise");
    cast(game, spell, { targets: [ref(giant)] });
    expect(game.state.objects[giant].faceDown).toBeUndefined();
    expect(zone(game, giant)).toBe("battlefield");
    // Hill Giant's 3, not the 2 of the face-down 2/2: the 0/3 Wall dies too.
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("a face-up target just deals the damage", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const spell = toHand(game, "Showstopping Surprise");
    cast(game, spell, { targets: [ref(bears)] });
    expect(turnedUpEvents(game, bears)).toBe(0);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("an instant or sorcery card (rules 701.40g, 701.58g)", () => {
  it("is revealed and stays face down, and nothing triggers", () => {
    const { game } = table();
    const bolt = faceDown(game, "Lightning Bolt");
    const before = game.state.eventLog.filter((e) => e.type === "cards-revealed").length;
    turnUp(game, bolt);
    expect(game.state.objects[bolt].faceDown).toBeDefined();
    expect(pt(game, bolt)).toEqual({ power: 2, toughness: 2 });
    expect(turnedUpEvents(game, bolt)).toBe(0);
    expect(game.state.eventLog.filter((e) => e.type === "cards-revealed").length).toBe(before + 1);
  });
});

describe("what forbids it", () => {
  it("Unable to Scream stops the effect too", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = faceDown(game, "Grizzly Bears");
    const aura = toHand(game, "Unable to Scream");
    cast(game, aura, { targets: [ref(bears)] });
    turnUp(game, bears);
    expect(game.state.objects[bears].faceDown).toBeDefined();
    expect(turnedUpEvents(game, bears)).toBe(0);
  });

  it("Karlov Watchdog stops both ways during your turn, for your opponents' permanents", () => {
    const { game } = table();
    spawn(game, "Karlov Watchdog");
    const theirs = faceDown(game, "Grizzly Bears", B);
    const mine = faceDown(game, "Hill Giant");
    lands(game, "Forest", 2, B);
    // Alice's turn: an effect does nothing to Bob's, and her own turns up.
    turnUp(game, theirs);
    expect(game.state.objects[theirs].faceDown).toBeDefined();
    turnUp(game, mine);
    expect(game.state.objects[mine].faceDown).toBeUndefined();
    // Nor may Bob turn his up, holding priority in her turn.
    const action = { type: "turn-face-up", player: B, permanent: theirs } as Action;
    game.advanceUntil((s) => s.turn.number === 1 && s.priority.holder === B);
    expect(game.canDispatch(action)).toMatch(/can't be turned face up/);

    // Bob's turn: free again, by his own special action.
    nextTurn(game);
    expect(game.activePlayer).toBe(B);
    game.advanceUntil((s) => s.priority.holder === B && s.turn.step === "precombat-main");
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    expect(game.state.objects[theirs].faceDown).toBeUndefined();
  });
});

describe("you may turn a face-down creature you control face up", () => {
  const spec: EffectSpec = {
    kind: "choose-permanents",
    filter: { type: "creature", faceDown: true, controlledBy: "you" },
    min: 0,
    upTo: 1,
    prompt: "You may turn a face-down creature you control face up",
    then: { kind: "turn-face-up", target: 0 },
  };

  it("offers your face-down creatures and turns the one chosen", () => {
    const { game, a } = table();
    const one = faceDown(game, "Grizzly Bears");
    const other = faceDown(game, "Hill Giant");
    faceDown(game, "Llanowar Elves", B);
    spawn(game, "Wall of Wood");
    const seen = pickPermanents(a, one);
    game.debugApplyEffect(A, spec);
    settle(game);
    expect([...seen.offered].sort()).toEqual([one, other].sort());
    expect(game.state.objects[one].faceDown).toBeUndefined();
    expect(game.state.objects[other].faceDown).toBeDefined();
  });

  it("may turn none", () => {
    const { game, a } = table();
    const one = faceDown(game, "Grizzly Bears");
    pickPermanents(a);
    game.debugApplyEffect(A, spec);
    settle(game);
    expect(game.state.objects[one].faceDown).toBeDefined();
  });
});
