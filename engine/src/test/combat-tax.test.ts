/**
 * A cost on a particular creature to attack or to block (`combatTax`, rules
 * 508.1h and 509.1d): Brainwash, Phyrexian Marauder and Nils on attacking,
 * Hipparion, Awesome Presence and War Cadence on blocking, Cowed by Wisdom on
 * both. Added up and paid as the declaration is made, refused when it can't
 * be, and never obliged by a requirement (508.1d, 509.1c).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { blockIsFree, blockingViolations, blockTaxTotal, withinBlockTax } from "../combat/blocking.js";
import { withinAttackTax, withRequiredAttackers } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, lands, pickTargets, settle, spawn, table, toHand, toStep } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
type BlockOffer = Extract<LegalAction, { kind: "declare-blockers" }>;

const ready = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  game.state.objects[id].tapped = false;
  return id;
};
const attachTo = (game: Game, aura: string, host: ObjectId, controller = B): ObjectId => {
  const id = spawn(game, aura, controller);
  game.state.objects[id].attachedTo = host;
  return id;
};
const toAttackers = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  return game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers")!;
};
const untapped = (game: Game, player = A): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === player && o.cardName === "Wastes" && !o.tapped;
  }).length;

/** B to declare blocks against `attacker`, A having attacked with it. */
const toBlocks = (game: Game, attackers: readonly ObjectId[]): BlockOffer => {
  toAttackers(game);
  game.dispatch({
    type: "declare-attackers",
    player: A,
    attackers: attackers.map((attacker) => ({ attacker, defender: B })),
  });
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.result.over);
  return game.legalActions(B).find((a): a is BlockOffer => a.kind === "declare-blockers")!;
};

describe("a cost to attack with a creature", () => {
  it("is paid whoever it attacks, by the creature's controller (Brainwash)", () => {
    const { game } = table();
    const bears = ready(game, "Grizzly Bears");
    attachTo(game, "Brainwash", bears);
    lands(game, "Wastes", 4);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[bears]?.[B]).toEqual({ generic: 3, life: 0 });
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    expect(game.state.objects[bears].attacking).toBe(B);
    expect(untapped(game)).toBe(1);
  });

  it("is refused when it can't be paid, and costs nothing to stay home", () => {
    const { game } = table();
    const bears = ready(game, "Grizzly Bears");
    const other = ready(game, "Grizzly Bears");
    attachTo(game, "Brainwash", bears);
    lands(game, "Wastes", 2);
    toAttackers(game);
    expect(() =>
      game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] }),
    ).toThrow(/can't pay the \{3\}/);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: other, defender: B }] });
    expect(game.state.objects[other].attacking).toBe(B);
    expect(untapped(game)).toBe(2);
  });

  it("doesn't count an attacker's own mana: it taps first (rule 508.1f)", () => {
    const { game } = table();
    const elves = ready(game, "Llanowar Elves");
    attachTo(game, "Brainwash", elves);
    lands(game, "Wastes", 2);
    toAttackers(game);
    expect(() =>
      game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: elves, defender: B }] }),
    ).toThrow(/can't pay/);
  });

  it("isn't obliged by a requirement (rule 508.1d)", () => {
    const { game } = table();
    const forced = ready(game, "Juggernaut");
    attachTo(game, "Brainwash", forced);
    lands(game, "Wastes", 3);
    const offer = toAttackers(game);
    expect(offer.mustAttack).not.toContain(forced);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [] });
    expect(game.state.objects[forced].attacking).toBeNull();
    expect(untapped(game)).toBe(3);
  });

  it("is cut by a driver that doesn't weigh it, the other attackers staying", () => {
    const { game } = table();
    const taxed = ready(game, "Grizzly Bears");
    const free = ready(game, "Grizzly Bears");
    attachTo(game, "Brainwash", taxed);
    lands(game, "Wastes", 1);
    const offer = toAttackers(game);
    const declared = [
      { attacker: free, defender: B },
      { attacker: taxed, defender: B },
    ];
    expect(withinAttackTax(declared, offer)).toEqual([{ attacker: free, defender: B }]);
    expect(withRequiredAttackers(declared, offer)).toEqual([{ attacker: free, defender: B }]);
  });

  it("reads the counters as it's determined (Phyrexian Marauder)", () => {
    const { game } = table();
    const marauder = ready(game, "Phyrexian Marauder");
    game.state.objects[marauder].counters["+1/+1"] = 2;
    lands(game, "Wastes", 3);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[marauder]?.[B]).toEqual({ generic: 2, life: 0 });
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: marauder, defender: B }] });
    expect(untapped(game)).toBe(1);
  });

  it("is X counters of any kind, only on attacking Nils's controller or their planeswalkers", () => {
    const { game } = table({ players: 3 });
    const nils = spawn(game, "Nils, Discipline Enforcer", B);
    const walker = spawn(game, "Jace Beleren", B);
    const countered = ready(game, "Grizzly Bears");
    game.state.objects[countered].counters = { "+1/+1": 1, shield: 1 };
    const bare = ready(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const offer = toAttackers(game);
    const rates = offer.attackTax?.perAttacker?.[countered];
    expect(rates?.[B]?.generic).toBe(2);
    expect(rates?.[walker]?.generic).toBe(2);
    expect(rates?.[C]).toBeUndefined();
    expect(offer.attackTax?.perAttacker?.[bare]).toBeUndefined();
    expect(nils).toBeDefined();
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: countered, defender: C }] });
    expect(untapped(game)).toBe(2);
  });

  it("puts a +1/+1 counter on up to one creature each player controls (Nils)", () => {
    const { game, a } = table();
    spawn(game, "Nils, Discipline Enforcer");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[mine].counters["+1/+1"]).toBe(1);
    expect(game.state.objects[theirs].counters["+1/+1"]).toBe(1);
  });

  it("counts cards in the Aura's controller's hand (Cowed by Wisdom)", () => {
    const { game } = table();
    const bears = ready(game, "Grizzly Bears");
    attachTo(game, "Cowed by Wisdom", bears);
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    const held = game.state.zones.perPlayer[B].hand.length;
    expect(game.state.zones.perPlayer[A].hand.length).not.toBe(held);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[bears]?.[B]?.generic).toBe(held);
  });

  it("taxes a block the same way (Cowed by Wisdom)", () => {
    const { game } = table();
    const attacker = ready(game, "Grizzly Bears");
    const blocker = ready(game, "Grizzly Bears", B);
    attachTo(game, "Cowed by Wisdom", blocker, A);
    const offer = toBlocks(game, [attacker]);
    expect(offer.blockTax?.onBlocker?.[blocker]?.[0]?.generic).toBe(game.state.zones.perPlayer[A].hand.length);
    expect(blockIsFree(offer, blocker, attacker)).toBe(false);
  });
});

describe("a cost to block", () => {
  it("is asked only of the attackers it names, and paid (Hipparion)", () => {
    const { game } = table();
    const small = ready(game, "Grizzly Bears");
    const big = ready(game, "Hill Giant");
    const hipparion = ready(game, "Hipparion", B);
    lands(game, "Wastes", 1, B);
    const offer = toBlocks(game, [small, big]);
    expect(blockIsFree(offer, hipparion, small)).toBe(true);
    expect(blockIsFree(offer, hipparion, big)).toBe(false);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: hipparion, attacker: big }] });
    expect(game.state.objects[hipparion].blocking).toBe(big);
    expect(untapped(game, B)).toBe(0);
  });

  it("costs nothing on an attacker it doesn't name", () => {
    const { game } = table();
    const small = ready(game, "Grizzly Bears");
    const hipparion = ready(game, "Hipparion", B);
    lands(game, "Wastes", 1, B);
    toBlocks(game, [small]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: hipparion, attacker: small }] });
    expect(untapped(game, B)).toBe(1);
  });

  it("is refused when it can't be paid", () => {
    const { game } = table();
    const big = ready(game, "Hill Giant");
    const hipparion = ready(game, "Hipparion", B);
    toBlocks(game, [big]);
    expect(() =>
      game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: hipparion, attacker: big }] }),
    ).toThrow(/can't pay the \{1\} it costs to block/);
  });

  it("is per creature blocking the taxed attacker (Awesome Presence)", () => {
    const { game } = table();
    const big = ready(game, "Hill Giant");
    attachTo(game, "Awesome Presence", big, A);
    const one = ready(game, "Grizzly Bears", B);
    const two = ready(game, "Grizzly Bears", B);
    lands(game, "Wastes", 7, B);
    const offer = toBlocks(game, [big]);
    expect(offer.blockTax?.onAttacker?.[big]).toEqual({ generic: 3, life: 0 });
    game.dispatch({
      type: "declare-blockers",
      player: B,
      blocks: [
        { blocker: one, attacker: big },
        { blocker: two, attacker: big },
      ],
    });
    expect(game.state.objects[big].blockedBy).toEqual([one, two]);
    expect(untapped(game, B)).toBe(1);
  });

  it("is not obliged by a requirement (rule 509.1c)", () => {
    const { game } = table();
    const lured = ready(game, "Hill Giant");
    attachTo(game, "Lure", lured, A);
    const hipparion = ready(game, "Hipparion", B);
    const bears = ready(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1, B);
    const offer = toBlocks(game, [lured]);
    // The Bears must, for free; the Hipparion needn't pay to.
    expect(blockingViolations([{ blocker: bears, attacker: lured }], offer)).toEqual([]);
    expect(blockingViolations([], offer).map((v) => v.kind)).toEqual(["must-be-blocked"]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: lured }] });
    expect(game.state.objects[hipparion].blocking).toBeNull();
    expect(untapped(game, B)).toBe(1);
  });

  it("is every block by anyone this turn, X fixed on resolving (War Cadence)", () => {
    const { game } = table();
    const cadence = spawn(game, "War Cadence");
    lands(game, "Mountain", 3);
    const attacker = ready(game, "Grizzly Bears");
    const one = ready(game, "Grizzly Bears", B);
    const two = ready(game, "Grizzly Bears", B);
    lands(game, "Wastes", 5, B);
    activate(game, cadence, 0, { x: 2 });
    const offer = toBlocks(game, [attacker]);
    const pair = [
      { blocker: one, attacker },
      { blocker: two, attacker },
    ];
    expect(blockTaxTotal(pair, offer.blockTax!, () => 1)).toEqual({ generic: 4, life: 0 });
    game.dispatch({ type: "declare-blockers", player: B, blocks: pair });
    expect(untapped(game, B)).toBe(1);
  });

  it("runs only while its condition holds (Archangel of Tithes)", () => {
    const { game } = table();
    const archangel = ready(game, "Archangel of Tithes");
    const ground = ready(game, "Grizzly Bears");
    const blocker = ready(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1, B);
    const offer = toBlocks(game, [archangel, ground]);
    expect(offer.blockTax?.onBlocker?.[blocker]).toEqual([{ generic: 1, life: 0 }]);
    // Whichever attacker it blocks: the tax doesn't name the Archangel.
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker, attacker: ground }] });
    expect(untapped(game, B)).toBe(0);
  });

  it("charges nothing with its condition off (Archangel of Tithes at home)", () => {
    const { game } = table();
    const attacker = ready(game, "Grizzly Bears");
    ready(game, "Archangel of Tithes");
    const blocker = ready(game, "Grizzly Bears", B);
    const offer = toBlocks(game, [attacker]);
    expect(offer.blockTax).toBeUndefined();
    expect(blockIsFree(offer, blocker, attacker)).toBe(true);
  });

  it("charges a creature blocking two attackers once", () => {
    const blocks = [
      { blocker: "b" as ObjectId, attacker: "x" as ObjectId },
      { blocker: "b" as ObjectId, attacker: "y" as ObjectId },
    ];
    expect(blockTaxTotal(blocks, { onBlocker: { ["b" as ObjectId]: [{ generic: 3, life: 1 }] } }, () => 1)).toEqual({
      generic: 3,
      life: 1,
    });
  });

  it("charges each token of a stack, entry by entry", () => {
    const blocks = [
      { blocker: "s" as ObjectId, attacker: "x" as ObjectId, count: 2 },
      { blocker: "s" as ObjectId, attacker: "y" as ObjectId, count: 1 },
    ];
    expect(blockTaxTotal(blocks, { onBlocker: { ["s" as ObjectId]: [{ generic: 1, life: 0 }] } }, () => 3).generic).toBe(3);
  });

  it("is cut by a driver that doesn't weigh it, a menace pair going whole", () => {
    const { game } = table();
    const menace = ready(game, "Boggart Brute");
    const hipparion = ready(game, "Hipparion", B);
    const bears = ready(game, "Grizzly Bears", B);
    const offer = toBlocks(game, [menace]);
    const pair = [
      { blocker: bears, attacker: menace },
      { blocker: hipparion, attacker: menace },
    ];
    expect(withinBlockTax(pair, offer)).toEqual([]);
  });
});
