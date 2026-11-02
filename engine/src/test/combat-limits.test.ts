/**
 * Limits on how many creatures may attack or block (`combat/limits.ts`, rules
 * 508.1c and 509.1b): over everyone, on one defender or planeswalker, under a
 * condition, for one combat; requirements obeying them first (508.1d, 509.1c);
 * and every driver cutting its declaration to fit.
 */
import { describe, expect, it } from "vitest";
import { attackCaps, blockersLeft } from "../combat/limits.js";
import type { BlockerDeclaration, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, life, named, spawn, table, type Table, zone } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
type BlockOffer = Extract<LegalAction, { kind: "declare-blockers" }>;

/** The game at the moment Alice declares attackers, with her offer. */
const atAttackers = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(A).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error("no attackers offer");
  return offer;
};

const declare = (
  game: Game,
  attackers: readonly { attacker: ObjectId; defender: PlayerId | ObjectId; count?: number }[],
): string | null => game.canDispatch({ type: "declare-attackers", player: A, attackers });

const bears = (game: Game, n: number, player: PlayerId = A): ObjectId[] =>
  Array.from({ length: n }, () => spawn(game, "Grizzly Bears", player));

/** Alice's `attackers` attack; the game runs to `player`'s blocks. */
const atBlockers = (game: Game, a: Table["a"], attackers: readonly ObjectId[], player: PlayerId = B): BlockOffer => {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.awaiting?.kind === "blockers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is BlockOffer => o.kind === "declare-blockers");
  if (offer === undefined) throw new Error("no blockers offer");
  return offer;
};

const blockBy = (game: Game, player: PlayerId, blocks: readonly BlockerDeclaration[]): string | null =>
  game.canDispatch({ type: "declare-blockers", player, blocks });

describe("no more than N creatures can attack", () => {
  it("over everyone, its controller too (Silent Arbiter)", () => {
    const { game } = table();
    spawn(game, "Silent Arbiter", B);
    const [x, y] = bears(game, 2);
    atAttackers(game);
    expect(declare(game, [{ attacker: x, defender: B }])).toBeNull();
    expect(declare(game, [{ attacker: x, defender: B }, { attacker: y, defender: B }])).toMatch(/No more than one creature can attack each combat/);
  });

  it("on its controller alone, not their planeswalkers nor another player (Crawlspace)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Crawlspace", B);
    const walker = spawn(game, "Jace Beleren", B);
    const [x, y, z, w] = bears(game, 4);
    const offer = atAttackers(game);
    expect(offer.company?.caps?.perDefender?.[B]).toBe(2);
    expect(declare(game, [{ attacker: x, defender: B }, { attacker: y, defender: B }])).toBeNull();
    expect(
      declare(game, [{ attacker: x, defender: B }, { attacker: y, defender: B }, { attacker: z, defender: B }]),
    ).toMatch(/No more than 2 creatures can attack bob each combat/);
    expect(
      declare(game, [
        { attacker: x, defender: B },
        { attacker: y, defender: B },
        { attacker: z, defender: walker },
        { attacker: w, defender: C },
      ]),
    ).toBeNull();
  });

  it("on a planeswalker, each granted its own limit (Tomik)", () => {
    const { game } = table();
    spawn(game, "Tomik, Orzhov Lawmage", B);
    const one = spawn(game, "Jace Beleren", B);
    const two = spawn(game, "Chandra Nalaar", B);
    const [x, y, z] = bears(game, 3);
    const offer = atAttackers(game);
    expect(offer.company?.caps?.perDefender).toEqual({ [one]: 1, [two]: 1 });
    expect(declare(game, [{ attacker: x, defender: one }, { attacker: y, defender: two }, { attacker: z, defender: B }])).toBeNull();
    expect(declare(game, [{ attacker: x, defender: one }, { attacker: y, defender: one }])).toMatch(/No more than one creature can attack /);
  });

  it("only while its condition holds, read at the declaration (Mirri)", () => {
    const { game } = table();
    const mirri = spawn(game, "Mirri, Weatherlight Duelist", B);
    expect(attackCaps(game.state, game.registry)).toBeNull();
    game.state.objects[mirri].tapped = true;
    expect(attackCaps(game.state, game.registry)).toEqual({ perDefender: { [B]: 1 } });
  });

  it("a token stack counts every token, and may send only some", () => {
    const { game } = table();
    spawn(game, "Silent Arbiter", B);
    const stack = spawn(game, "Grizzly Bears");
    game.state.objects[stack].stackCount = 3;
    game.state.objects[stack].isToken = true;
    atAttackers(game);
    expect(declare(game, [{ attacker: stack, defender: B }])).toMatch(/No more than one/);
    expect(declare(game, [{ attacker: stack, defender: B, count: 1 }])).toBeNull();
  });

  it("leaves out a creature that can't attack alone: it has no group to go in", () => {
    const { game } = table();
    spawn(game, "Silent Arbiter", B);
    spawn(game, "Mogg Flunkies");
    spawn(game, "Mogg Flunkies");
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    expect(game.state.awaiting?.kind).not.toBe("attackers");
  });

  it("a requirement yields to it (508.1d): one of two that must attack does", () => {
    const { game, a } = table();
    spawn(game, "Silent Arbiter", B);
    const x = spawn(game, "Juggernaut");
    const y = spawn(game, "Juggernaut");
    const offer = atAttackers(game);
    // Neither has to be the one, so neither is simply "must attack".
    expect(offer.mustAttack).toEqual([]);
    expect(declare(game, [])).toMatch(/Only 0 of the 1/);
    expect(declare(game, [{ attacker: y, defender: B }])).toBeNull();
    // A driver that says nothing gets one sent for it.
    a.declareAttackersFn = () => [];
    game.advanceUntil((s) => s.awaiting === null);
    const attacking = [x, y].filter((id) => game.state.objects[id].attacking !== null);
    expect(attacking.length).toBe(1);
  });

  it("a requirement counts seats: those that can go elsewhere make room (a matching)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Crawlspace", B);
    spawn(game, "Crawlspace", C);
    const j = [spawn(game, "Juggernaut"), spawn(game, "Juggernaut"), spawn(game, "Juggernaut"), spawn(game, "Juggernaut"), spawn(game, "Juggernaut")];
    const offer = atAttackers(game);
    expect(offer.mustAttack).toEqual([]);
    const all = (n: number) => j.slice(0, n).map((attacker, i) => ({ attacker, defender: i < 2 ? B : C }));
    expect(declare(game, all(3))).toMatch(/Only 3 of the 4/);
    expect(declare(game, all(4))).toBeNull();
    expect(declare(game, all(5))).toMatch(/No more than 2 creatures can attack carol/);
  });

  it("cuts a bot's declaration to fit, keeping what it declared first", () => {
    const { game, a } = table();
    spawn(game, "Crawlspace", B);
    const [x, y, z] = bears(game, 3);
    a.declareAttackersFn = () => [x, y, z].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || s.turn.step === "combat-damage" || s.turn.step === "postcombat-main");
    expect([x, y, z].filter((id) => game.state.objects[id].attacking !== null).length).toBe(2);
  });

  it("is read only at the declaration: Mirri tapped after doesn't remove anyone", () => {
    const { game, a } = table();
    const mirri = spawn(game, "Mirri, Weatherlight Duelist", B);
    const [x, y] = bears(game, 2);
    a.declareAttackersFn = () => [x, y].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    game.state.objects[mirri].tapped = true;
    expect(game.state.objects[x].attacking).toBe(B);
    expect(game.state.objects[y].attacking).toBe(B);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBeLessThan(20);
  });
});

describe("no more than N creatures can block", () => {
  it("over one declaration (Silent Arbiter)", () => {
    const { game, a } = table();
    spawn(game, "Silent Arbiter", B);
    const x = spawn(game, "Grizzly Bears");
    const [p, q] = bears(game, 2, B);
    const offer = atBlockers(game, a, [x]);
    expect(offer.blockMost).toBe(1);
    expect(blockBy(game, B, [{ blocker: p, attacker: x }])).toBeNull();
    expect(blockBy(game, B, [{ blocker: p, attacker: x }, { blocker: q, attacker: x }])).toMatch(/No more than one creature can block/);
  });

  it("across defending players: the first to block uses it up", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Caverns of Despair", C);
    const [x, y] = bears(game, 2);
    const [p, q] = bears(game, 2, B);
    const [r] = bears(game, 1, C);
    a.declareAttackersFn = () => [{ attacker: x, defender: B }, { attacker: y, defender: C }];
    // One of Bob's two leaves Carol the other.
    b.declareBlockersFn = () => [{ blocker: p, attacker: x }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" && s.awaiting.player === C);
    expect(game.state.objects[p].blocking).toBe(x);
    expect(blockersLeft(game.state, game.registry, C)).toBe(1);
    expect(game.state.objects[r].blocking).toBeNull();
    expect(game.state.objects[q].blocking).toBeNull();
  });

  it("across defending players: with none left, the next isn't asked", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Caverns of Despair", C);
    const [x, y] = bears(game, 2);
    const [p, q] = bears(game, 2, B);
    bears(game, 1, C);
    a.declareAttackersFn = () => [{ attacker: x, defender: B }, { attacker: y, defender: C }];
    b.declareBlockersFn = () => [{ blocker: p, attacker: x }, { blocker: q, attacker: x }];
    game.advanceUntil((s) => s.turn.step === "combat-damage" || (s.awaiting?.kind === "blockers" && s.awaiting.player === C));
    expect(game.state.turn.step).toBe("combat-damage");
    expect(blockersLeft(game.state, game.registry, C)).toBe(0);
  });

  it("makes menace unblockable when the limit is one", () => {
    const { game, a } = table();
    spawn(game, "Dueling Grounds", B);
    const menace = spawn(game, "Boggart Brute");
    bears(game, 2, B);
    a.declareAttackersFn = () => [{ attacker: menace, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    for (const entry of offer?.eligible ?? []) expect(entry.canBlock).not.toContain(menace);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(17);
  });

  it("a requirement yields to it (509.1c): Lure, one of two able", () => {
    const { game, a } = table();
    spawn(game, "Dueling Grounds", B);
    const lured = spawn(game, "Breaker of Armies");
    const [p, q] = bears(game, 2, B);
    atBlockers(game, a, [lured]);
    expect(blockBy(game, B, [])).not.toBeNull();
    expect(blockBy(game, B, [{ blocker: p, attacker: lured }])).toBeNull();
    expect(blockBy(game, B, [{ blocker: q, attacker: lured }])).toBeNull();
    // A driver asked gets the one block, not both.
    game.advanceUntil((s) => s.awaiting === null);
    expect([p, q].filter((id) => game.state.objects[id].blocking !== null).length).toBe(1);
  });

  it("cuts a bot's declaration to fit", () => {
    const { game, a, b } = table();
    spawn(game, "Silent Arbiter", B);
    const x = spawn(game, "Grizzly Bears");
    const [p, q] = bears(game, 2, B);
    b.declareBlockersFn = () => [{ blocker: p, attacker: x }, { blocker: q, attacker: x }];
    atBlockers(game, a, [x]);
    game.advanceUntil((s) => s.awaiting === null);
    expect([p, q].filter((id) => game.state.objects[id].blocking !== null).length).toBe(1);
  });
});

describe("can't block with more than N creatures this combat (Mirri)", () => {
  it("limits each opponent, this combat only", () => {
    const { game, a } = table({ players: 3 });
    const mirri = spawn(game, "Mirri, Weatherlight Duelist");
    const [p, q] = bears(game, 2, B);
    bears(game, 2, C);
    const offer = atBlockers(game, a, [mirri]);
    expect(offer.blockMost).toBe(1);
    expect(blockersLeft(game.state, game.registry, C)).toBe(1);
    expect(blockersLeft(game.state, game.registry, A)).toBeNull();
    expect(blockBy(game, B, [{ blocker: p, attacker: mirri }, { blocker: q, attacker: mirri }])).toMatch(/No more than one/);
    // It's gone with the combat phase: a later one of the turn isn't limited.
    game.state.turn.combatPhases = (game.state.turn.combatPhases ?? 0) + 1;
    expect(blockersLeft(game.state, game.registry, B)).toBeNull();
    expect(activePlayerOf(game.state)).toBe(A);
  });

  it("is also Mirri's own limit while tapped from attacking", () => {
    const { game, a } = table();
    const mirri = spawn(game, "Mirri, Weatherlight Duelist");
    bears(game, 1, B);
    atBlockers(game, a, [mirri]);
    expect(game.state.objects[mirri].tapped).toBe(true);
    expect(attackCaps(game.state, game.registry)).toEqual({ perDefender: { [A]: 1 } });
    expect(named(game, "Mirri, Weatherlight Duelist").length).toBe(1);
    expect(zone(game, mirri)).toBe("battlefield");
  });
});
