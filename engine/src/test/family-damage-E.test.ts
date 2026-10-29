/**
 * Batch B250, damage group E: cards freed by the damage-modification family
 * (rules 614.9, 615) — static redirections and partial preventions, the
 * one-shot `damage-rule`, and damage that can't be prevented.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const attach = (game: Game, aura: ObjectId, to: ObjectId): void => {
  game.state.objects[aura].attachedTo = to;
};
const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters = { ...(game.state.objects[id].counters ?? {}), [kind]: n };
};

describe("static preventions and redirections", () => {
  it("Temple Altisaur leaves 1 of each source's damage to another Dinosaur, not to itself", () => {
    const { game } = table();
    const altisaur = spawn(game, "Temple Altisaur");
    const ghalta = spawn(game, "Ghalta, Primal Hunger");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(ghalta), 5);
    expect(damage(game, ghalta)).toBe(1);
    hit(game, goblin, ref(altisaur), 3);
    expect(damage(game, altisaur)).toBe(3);
  });

  it("Pariah's Shield sends damage to you to the equipped creature; unattached, you take it", () => {
    const { game } = table();
    const shield = spawn(game, "Pariah's Shield");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
    attach(game, shield, bears);
    hit(game, goblin, ref(A), 1);
    expect(life(game, A)).toBe(18);
    expect(damage(game, bears)).toBe(1);
  });

  it("Hedron-Field Purists prevents 1 at level 1-4 and 2 at level 5, to you and your creatures", () => {
    const { game } = table();
    const purists = spawn(game, "Hedron-Field Purists");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(17);
    setCounters(game, purists, "level", 1);
    expect(pt(game, purists)).toEqual({ power: 1, toughness: 4 });
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(15);
    hit(game, goblin, ref(bears), 1);
    expect(damage(game, bears)).toBe(0);
    setCounters(game, purists, "level", 5);
    expect(pt(game, purists)).toEqual({ power: 2, toughness: 5 });
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(14);
  });

  it("Thunderstaff prevents 1 from each attacking creature while untapped, none while tapped", () => {
    const { game, b } = table();
    const staff = spawn(game, "Thunderstaff");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [one, two], A);
    expect(life(game, A)).toBe(18);
    nextTurn(game);
    nextTurn(game);
    game.state.objects[staff].tapped = true;
    attack(game, b, [one, two], A);
    expect(life(game, A)).toBe(14);
  });

  it("Weathered Bodyguards takes unblocked creatures' combat damage to you while untapped", () => {
    const { game, b } = table();
    const guards = spawn(game, "Weathered Bodyguards");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
    expect(damage(game, guards)).toBe(2);
  });

  it("Weathered Bodyguards does nothing while tapped", () => {
    const { game, b } = table();
    const guards = spawn(game, "Weathered Bodyguards", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    game.state.objects[guards].tapped = true;
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(18);
    expect(damage(game, guards)).toBe(0);
  });
});

describe("Nine Lives and Immortal Coil", () => {
  it("Nine Lives prevents damage to you for a counter each time; at nine it's exiled and you lose", () => {
    const { game } = table();
    const lives = spawn(game, "Nine Lives");
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[lives].counters?.incarnation).toBe(1);
    setCounters(game, lives, "incarnation", 8);
    hit(game, goblin, ref(A), 1);
    settle(game);
    expect(zone(game, lives)).toBe("exile");
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Immortal Coil exiles a card from your graveyard per damage prevented, then you lose with none left", () => {
    const { game, a } = table();
    spawn(game, "Immortal Coil");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const asked: number[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(min);
      return eligible.slice(0, min);
    };
    hit(game, goblin, ref(A), 2);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(graveyard(game, A)).toHaveLength(1);
    expect(game.state.players[A].hasLost).toBe(false);
    // More damage than cards: all of it prevented, the graveyard emptied.
    hit(game, goblin, ref(A), 5);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(graveyard(game, A)).toHaveLength(0);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Immortal Coil asks once for a combat damage event from two attackers", () => {
    const { game, a, b } = table();
    spawn(game, "Immortal Coil");
    for (let i = 0; i < 6; i += 1) toGraveyard(game, "Grizzly Bears");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const asked: number[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push(min);
      return eligible.slice(0, min);
    };
    nextTurn(game);
    attack(game, b, [one, two], A);
    expect(life(game, A)).toBe(20);
    expect(graveyard(game, A)).toHaveLength(2);
    expect(asked).toEqual([4]);
  });
});

describe("one-shot damage rules", () => {
  it("Ith, High Arcanist untaps an attacker and prevents its combat damage", () => {
    const { game, b } = table();
    const ith = spawn(game, "Ith, High Arcanist");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    activate(game, ith, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(20);
  });

  it("Hallow prevents a target spell's damage and its controller gains that much", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Hallow"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(23);
  });

  it("Lightning Surge with threshold deals 6 that Glacial Chasm can't prevent; without, 4 prevented", () => {
    const { game } = table();
    spawn(game, "Glacial Chasm", B);
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "Lightning Surge"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Lightning Surge"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });

  it("Bonecrusher Giant deals 2 damage to the controller of a spell targeting it", () => {
    const { game } = table();
    const giant = spawn(game, "Bonecrusher Giant", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    expect(damage(game, giant)).toBe(2);
  });
});
