/**
 * A goad whose end is a condition (rule 701.15, 611.2b), carried by a modifier
 * (`PtModifier.goadedBy`) so it ends the way that modifier does: while its source
 * remains (The War Games, Hot Pursuit), while a player controls it (Vislor
 * Turlough), while it has a counter (Immortal Obligation). And what surrounds them:
 * goading the trigger object (Kros, Defense Contractor), ending goads (Serene
 * Sleuth), a static goad on a copy's exception (Mocking Doppelganger) and on an
 * Equipment put on an opponent's creature (Bloodthirsty Blade), and a creature
 * that can't become suspected (Airtight Alibi).
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import { goadersOf } from "../goad.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
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
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const goaders = (game: Game, id: ObjectId) => goadersOf(game.state, registryOf(game), id);

describe("goaded while the source remains", () => {
  it("Hot Pursuit: suspected and goaded, the goad gone as it leaves and the suspicion kept", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    cast(game, toHand(game, "Hot Pursuit"));
    const pursuit = named(game, "Hot Pursuit")[0];
    expect(goaders(game, bear)).toEqual([A]);
    expect(game.state.objects[bear].suspectedAt).toBeDefined();
    // Past Alice's next turn: a plain goad would have ended.
    nextTurn(game);
    nextTurn(game);
    expect(goaders(game, bear)).toEqual([A]);
    destroy(game, pursuit);
    expect(goaders(game, bear)).toEqual([]);
    expect(game.state.objects[bear].suspectedAt).toBeDefined();
  });

  it("Hot Pursuit: gone before its trigger resolves, the target is suspected but not goaded (the ruling)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    const pursuit = enter(game, "Hot Pursuit", A, { settle: false });
    game.debugMove(pursuit, "graveyard");
    settle(game);
    expect(goaders(game, bear)).toEqual([]);
    expect(game.state.objects[bear].suspectedAt).toBeDefined();
  });

  it("Hot Pursuit: with two players out, you take all goaded and suspected creatures for the turn", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Hot Pursuit");
    const bear = spawn(game, "Grizzly Bears", C, { tapped: true });
    game.debugApplyEffect(A, { kind: "suspect", target: 0 }, [ref(bear)]);
    settle(game);
    // Nobody out: nothing yet.
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, bear)).toBe(C);
    nextTurn(game);
    game.state.players[B].hasLost = true;
    game.state.players["dave" as typeof B].hasLost = true;
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(keywords(game, bear).has("haste")).toBe(true);
  });

  it("The War Games: each player's three tapped tokens goaded by you, yours too, until the Saga goes", () => {
    const { game } = table({ players: 3 });
    const older = spawn(game, "Warrior Token", C);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "The War Games"));
    const saga = named(game, "The War Games")[0];
    for (const player of [A, B, C]) {
      const made = named(game, "Warrior Token", player).filter((id) => id !== older);
      expect(made.length).toBe(3);
      for (const token of made) {
        expect(game.state.objects[token].tapped).toBe(true);
        expect(goaders(game, token)).toEqual([A]);
      }
    }
    // An older Warrior isn't one of "the tokens".
    expect(goaders(game, older)).toEqual([]);
    const one = named(game, "Warrior Token", B)[0];
    destroy(game, saga);
    expect(goaders(game, one)).toEqual([]);
  });

  it("The War Games: II and III grow every Warrior creature; IV's exile takes all Warriors, or nothing without one", () => {
    const { game, a } = table();
    const saga = spawn(game, "The War Games");
    const bear = spawn(game, "Grizzly Bears");
    const warrior = spawn(game, "Warrior Token", B);
    game.state.objects[saga].counters.lore = 1;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, warrior)).toBe(1);
    expect(pt(game, warrior).power).toBe(2);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, warrior)).toBe(2);
    pickPermanents(a, bear);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, warrior)).not.toBe("battlefield");
  });
});

describe("goaded while a player controls it", () => {
  it("Vislor Turlough: an opponent gets it and it's goaded by you; back under your control, not goaded", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const vislor = enter(game, "Vislor Turlough");
    expect(controller(game, vislor)).toBe(B);
    expect(goaders(game, vislor)).toEqual([A]);
    // Past Alice's next turn.
    nextTurn(game);
    nextTurn(game);
    expect(goaders(game, vislor)).toEqual([A]);
    // Alice takes it back: over, and Bob regaining it doesn't renew it.
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(vislor)]);
    settle(game);
    expect(controller(game, vislor)).toBe(A);
    expect(goaders(game, vislor)).toEqual([]);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(vislor)]);
    settle(game);
    expect(controller(game, vislor)).toBe(B);
    expect(goaders(game, vislor)).toEqual([]);
  });

  it("Vislor Turlough: declined, you keep it, ungoaded; the end step draws and costs life per card in hand", () => {
    const { game, a } = table();
    pickModes(a);
    const vislor = enter(game, "Vislor Turlough");
    expect(controller(game, vislor)).toBe(A);
    expect(goaders(game, vislor)).toEqual([]);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(20 - (before + 1));
  });
});

describe("goaded while it has a counter", () => {
  const obligate = () => {
    const t = table();
    const card = toGraveyard(t.game, "Grizzly Bears", B);
    lands(t.game, "Plains", 2);
    cast(t.game, toHand(t.game, "Immortal Obligation"), { targets: [ref(card)] });
    const bear = named(t.game, "Grizzly Bears", B)[0];
    return { ...t, bear };
  };

  it("Immortal Obligation: back under its owner with a duty counter, goaded, can't attack you or yours, can't block yours", () => {
    const { game, bear } = obligate();
    expect(controller(game, bear)).toBe(B);
    expect(counters(game, bear, "duty")).toBe(1);
    expect(goaders(game, bear)).toEqual([A]);
    const pw = spawn(game, "Dovin Baan");
    const why = (target: PlayerId | ObjectId) => whyCannotAttack(game.state, registryOf(game), B, bear, target, { nextTurn: true });
    expect(why(A)).toMatch(/can't attack/);
    expect(why(pw)).toMatch(/can't attack/);
    // A player else can be attacked: another one in a bigger game.
    const { game: bigger } = table({ players: 3 });
    const card = toGraveyard(bigger, "Grizzly Bears", B);
    lands(bigger, "Plains", 2);
    cast(bigger, toHand(bigger, "Immortal Obligation"), { targets: [ref(card)] });
    const back = named(bigger, "Grizzly Bears", B)[0];
    expect(whyCannotAttack(bigger.state, registryOf(bigger), B, back, C, { nextTurn: true })).toBeNull();
  });

  it("the counter gone, all three end, and a new one doesn't bring them back", () => {
    const { game, bear } = obligate();
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "duty", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(goaders(game, bear)).toEqual([]);
    expect(game.state.objects[bear].modifiers.some((m) => m.cantAttackYou !== undefined)).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "duty", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(goaders(game, bear)).toEqual([]);
  });
});

describe("Kros, Defense Contractor", () => {
  it("your counter on their creature taps and goads it, with trample until your next turn; on your own it doesn't", () => {
    const { game } = table();
    const kros = spawn(game, "Kros, Defense Contractor");
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bear)]);
    settle(game);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(goaders(game, bear)).toEqual([A]);
    expect(keywords(game, bear).has("trample")).toBe(true);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(mine)]);
    settle(game);
    expect(goaders(game, mine)).toEqual([]);
    // Kros gone, so its upkeep trigger doesn't do it all again.
    destroy(game, kros);
    nextTurn(game);
    expect(goaders(game, bear)).toEqual([A]);
    nextTurn(game);
    expect(goaders(game, bear)).toEqual([]);
    expect(keywords(game, bear).has("trample")).toBe(false);
  });

  it("the upkeep trigger's shield counter fires it", () => {
    const { game, a } = table();
    spawn(game, "Kros, Defense Contractor");
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bear);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, bear, "shield")).toBe(1);
    expect(goaders(game, bear)).toEqual([A]);
  });
});

describe("Serene Sleuth", () => {
  it("a Clue per goaded creature you control, then each is no longer goaded, however it was", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Serene Sleuth");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const three = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "goad", target: 0 }, [ref(one)]);
    game.debugApplyEffect(C, { kind: "goad", target: 0, forGame: true }, [ref(two)]);
    game.debugApplyEffect(B, { kind: "goad", target: 0 }, [ref(theirs)]);
    settle(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(named(game, "Clue Token").length).toBe(2);
    expect(goaders(game, one)).toEqual([]);
    expect(goaders(game, two)).toEqual([]);
    expect(goaders(game, three)).toEqual([]);
    expect(goaders(game, theirs)).toEqual([B]);
  });
});

describe("Mocking Doppelganger", () => {
  it("a copy of an opponent's creature whose namesakes are goaded, not it", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", C);
    const unrelated = spawn(game, "Llanowar Elves", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Mocking Doppelganger"));
    const copy = named(game, "Mocking Doppelganger", A)[0];
    expect(game.state.objects[copy].copyOf).toBe("Grizzly Bears");
    expect(goaders(game, bears)).toEqual([A]);
    expect(goaders(game, other)).toEqual([A]);
    expect(goaders(game, unrelated)).toEqual([]);
    expect(goaders(game, copy)).toEqual([]);
    destroy(game, copy);
    expect(goaders(game, bears)).toEqual([]);
  });
});

describe("Bloodthirsty Blade", () => {
  it("{1} moves it onto an opponent's creature at sorcery speed: +2/+0 and goaded by you", () => {
    const { game } = table();
    const blade = spawn(game, "Bloodthirsty Blade");
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    activate(game, blade, 0, { targets: [ref(bear)] });
    expect(pt(game, bear).power).toBe(4);
    expect(goaders(game, bear)).toEqual([A]);
    activate(game, blade, 0, { targets: [ref(other)] });
    expect(goaders(game, bear)).toEqual([]);
    expect(goaders(game, other)).toEqual([A]);
    expect(controller(game, blade)).toBe(A);
  });
});

describe("Airtight Alibi", () => {
  it("untaps, hexproofs and clears a suspected creature, +2/+2, and it can't be suspected while enchanted", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.debugApplyEffect(B, { kind: "suspect", target: 0 }, [ref(bear)]);
    settle(game);
    expect(game.state.objects[bear].suspectedAt).toBeDefined();
    cast(game, toHand(game, "Airtight Alibi"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(keywords(game, bear).has("hexproof")).toBe(true);
    expect(game.state.objects[bear].suspectedAt).toBeUndefined();
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(B, { kind: "suspect", target: 0 }, [ref(bear)]);
    settle(game);
    expect(game.state.objects[bear].suspectedAt).toBeUndefined();
  });
});
