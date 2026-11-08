/**
 * Removing creatures from combat and what comes of it: Illusionist's Gambit's
 * additional combat with the same creatures forced to attack, and False Orders'
 * attackers unblocked and its creature made to block something else.
 */

import { hasRecord } from "./combat-probe.js";
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  lands,
  life,
  pickPermanents,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const toBlocks = (game: Game, holder: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === holder && s.awaiting === null);

describe("Illusionist's Gambit", () => {
  it("removes and untaps every attacker, and they must attack someone else in the new combat", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const home = spawn(game, "Llanowar Elves", A);
    lands(game, "Island", 4, C);
    const gambit = toHand(game, "Illusionist's Gambit", C);
    let declarations = 0;
    let bound: readonly ObjectId[] = [];
    a.declareAttackersFn = () => {
      declarations += 1;
      if (declarations === 1) {
        return [
          { attacker: giant, defender: C },
          { attacker: bears, defender: B },
        ];
      }
      const offer = game.legalActions(A).find((action) => action.kind === "declare-attackers");
      bound = offer?.kind === "declare-attackers" ? offer.mustAttack : [];
      return [
        { attacker: giant, defender: B },
        { attacker: bears, defender: B },
      ];
    };
    toBlocks(game, C);
    cast(game, gambit, { player: C, settle: false });
    game.advanceUntil(() => zone(game, gambit) === "graveyard");
    expect(game.state.objects[giant].attacking).toBe(null);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(false);
    const carol = life(game, C);
    const bob = life(game, B);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(declarations).toBe(2);
    // The Elves didn't attack before: not bound (the ruling).
    expect([...bound].sort()).toEqual([giant, bears].sort());
    expect(bound).not.toContain(home);
    expect(life(game, C)).toBe(carol);
    expect(life(game, B)).toBe(bob - 5);
  });

  it("they can't attack its caster, or a planeswalker its caster controls", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", A);
    const walker = spawn(game, "Jace Beleren", C);
    lands(game, "Island", 4, C);
    const gambit = toHand(game, "Illusionist's Gambit", C);
    let reasons: readonly (PlayerId | ObjectId)[] = [];
    let declarations = 0;
    a.declareAttackersFn = () => {
      declarations += 1;
      if (declarations === 1) return [{ attacker: giant, defender: C }];
      const offer = game.legalActions(A).find((action) => action.kind === "declare-attackers");
      if (offer?.kind === "declare-attackers") reasons = offer.defendersFor?.[giant] ?? [];
      return [{ attacker: giant, defender: B }];
    };
    toBlocks(game, C);
    cast(game, gambit, { player: C });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(declarations).toBe(2);
    expect(reasons).toContain(B);
    expect(reasons).not.toContain(C);
    expect(reasons).not.toContain(walker);
  });

  it("two players: nobody left to attack, so nothing is forced, and no damage", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 4, B);
    const gambit = toHand(game, "Illusionist's Gambit", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toBlocks(game, B);
    a.declareAttackersFn = () => [];
    cast(game, gambit, { player: B });
    expect(life(game, B)).toBe(20);
    expect(hasRecord(game, giant, "must-attack")).toBe(false);
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("the binding ends with that combat", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 4, C);
    const gambit = toHand(game, "Illusionist's Gambit", C);
    let declarations = 0;
    a.declareAttackersFn = () => {
      declarations += 1;
      return [{ attacker: giant, defender: declarations === 1 ? C : B }];
    };
    toBlocks(game, C);
    cast(game, gambit, { player: C });
    game.advanceUntil((s) => s.turn.number > 1);
    expect(declarations).toBe(2);
    expect(hasRecord(game, giant, "must-attack")).toBe(false);
  });

  it("is cast only on an opponent's turn, in the declare blockers step", () => {
    const { game } = table();
    lands(game, "Island", 4, A);
    const gambit = toHand(game, "Illusionist's Gambit", A);
    expect(() => cast(game, gambit)).toThrow();
  });
});

describe("False Orders", () => {
  const blockedGiant = (game: Game, a: ReturnType<typeof table>["a"], b: ReturnType<typeof table>["b"]) => {
    const giant = spawn(game, "Hill Giant", A);
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    return { giant, wall };
  };

  it("its only blocker gone, the attacker is unblocked and connects", () => {
    const { game, a, b } = table();
    const { giant, wall } = blockedGiant(game, a, b);
    const orders = toHand(game, "False Orders", A);
    pickPermanents(a);
    toBlocks(game, A);
    expect(game.state.objects[giant].blocked).toBe(true);
    cast(game, orders, { targets: [ref(wall)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[wall].damageMarked).toBe(0);
  });

  it("an attacker another creature also blocked stays blocked", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Llanowar Elves", B);
    lands(game, "Mountain", 1, A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: one, attacker: giant },
      { blocker: two, attacker: giant },
    ];
    pickPermanents(a);
    const orders = toHand(game, "False Orders", A);
    toBlocks(game, A);
    cast(game, orders, { targets: [ref(one)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(life(game, B)).toBe(20);
  });

  it("one that had two, the other gone before: still not blocked by only this one", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Llanowar Elves", B);
    lands(game, "Mountain", 2, A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: one, attacker: giant },
      { blocker: two, attacker: giant },
    ];
    pickPermanents(a);
    toBlocks(game, A);
    cast(game, toHand(game, "False Orders", A), { targets: [ref(two)] });
    expect(game.state.objects[giant].blockedBy).toEqual([one]);
    cast(game, toHand(game, "False Orders", A), { targets: [ref(one)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(life(game, B)).toBe(20);
  });

  it("may have it block another attacker, flying or not, the first one going through", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const angel = spawn(game, "Serra Angel", A); // flying
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, A);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: angel, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    const seen = pickPermanents(a, angel);
    const orders = toHand(game, "False Orders", A);
    toBlocks(game, A);
    cast(game, orders, { targets: [ref(wall)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(seen.offered).toEqual(expect.arrayContaining([giant, angel]));
    // The Giant's 3 through, the Angel blocked and the Bears dead.
    expect(life(game, B)).toBe(17);
    expect(zone(game, wall)).toBe("graveyard");
    expect(game.eventsOfType("blocker-declared").filter((e) => e.blocker === wall).length).toBe(2);
  });

  it("targets only a creature a defending player controls, one blocking or not", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    const idle = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1, A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    const seen = pickPermanents(a, giant);
    const orders = toHand(game, "False Orders", A);
    toBlocks(game, A);
    expect(() => cast(game, orders, { targets: [ref(giant)] })).toThrow();
    cast(game, orders, { targets: [ref(idle)], settle: false });
    game.advanceUntil((s) => s.turn.step === "postcombat-main" || s.turn.number > 1);
    expect(seen.offered).toEqual([giant]);
    // Not blocking, it may still be made to.
    expect(life(game, B)).toBe(20);
  });
});
