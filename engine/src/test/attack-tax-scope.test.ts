/**
 * The attack tax's shapes (rule 508.1h) past Ghostly Prison's fixed {N} on a
 * player: what it covers (you, your planeswalkers, or both — Baird, Onakke
 * Oathkeeper), an amount read live (Sphere of Safety, Collective Restraint), a
 * payment in life (rule 119.4 — Sivitri) and a tax for a while, its amount
 * fixed as it was created (rule 611.2b — Forbidding Spirit, War Tax).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { withinAttackTax, withRequiredAttackers } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, enter, lands, life, loyalty, nextTurn, spawn, table, toStep, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "declare-attackers" }>;

const toAttackers = (game: Game): Offer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((a): a is Offer => a.kind === "declare-attackers");
  if (offer === undefined) throw new Error("alice isn't declaring attackers");
  return offer;
};
const declare = (attackers: readonly ObjectId[], defender: PlayerId | ObjectId) => ({
  type: "declare-attackers" as const,
  player: A,
  attackers: attackers.map((attacker) => ({ attacker, defender })),
});
const untapped = (game: Game, ids: readonly ObjectId[]): number =>
  ids.filter((id) => !game.state.objects[id].tapped).length;

describe("what an attack tax covers", () => {
  it("'you or planeswalkers you control' taxes both", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Baird, Steward of Argive", B);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[B]).toBe(1);
    expect(offer.attackTax?.perCreature[walker]).toBe(1);
    game.dispatch(declare([bears], walker));
    expect(game.state.objects[bears].attacking).toBe(walker);
    expect(untapped(game, forests)).toBe(0);
  });

  it("refuses an attack on the planeswalker its controller can't pay for", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Baird, Steward of Argive", B);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    toAttackers(game);
    expect(game.canDispatch(declare([bears], walker))).toMatch(/can't pay/);
  });

  it("'planeswalkers you control' leaves the player free", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Onakke Oathkeeper", B);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[B]).toBeUndefined();
    expect(offer.attackTax?.perCreature[walker]).toBe(1);
    game.dispatch(declare([bears], B));
    expect(untapped(game, forests)).toBe(1);
  });

  it("only guards its own controller's: another opponent's planeswalker is free", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Baird, Steward of Argive", B);
    const theirs = spawn(game, "Ajani, Caller of the Pride", C);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[C]).toBeUndefined();
    expect(offer.attackTax?.perCreature[theirs]).toBeUndefined();
    game.dispatch(declare([bears], theirs));
    expect(game.state.objects[bears].attacking).toBe(theirs);
  });

  it("adds up across what covers the defender and nothing else", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Ghostly Prison", B); // {2}, the player only
    spawn(game, "Baird, Steward of Argive", B); // {1}, both
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[B]).toBe(3);
    expect(offer.attackTax?.perCreature[walker]).toBe(1);
  });
});

describe("an attack tax's amount", () => {
  it("is read as attackers are declared, from the taxing side (Sphere of Safety)", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Sphere of Safety", B);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    // An enchantment of alice's doesn't count: "enchantments you control".
    spawn(game, "Ghostly Prison", A);
    spawn(game, "Propaganda", B); // itself {2} more on the player
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[walker]).toBe(2);
    expect(offer.attackTax?.perCreature[B]).toBe(4);
  });

  it("counts basic land types, and is no tax at 0 (Collective Restraint)", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Collective Restraint", B);
    expect(toAttackers(game).attackTax).toBeUndefined();
  });

  it("counts the domain among the taxing player's lands (Collective Restraint)", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Collective Restraint", B);
    spawn(game, "Plains", B);
    spawn(game, "Plains", B);
    spawn(game, "Island", B);
    spawn(game, "Swamp", A); // alice's lands aren't "you"
    expect(toAttackers(game).attackTax?.perCreature[B]).toBe(2);
  });
});

describe("an attack tax paid in life", () => {
  /** Alice to declare with `n` Bears, under Sivitri's +1 from bob. */
  const underSivitri = (n: number, aliceLife = 20) => {
    const { game } = table({ life: aliceLife });
    const bears = Array.from({ length: n }, () => spawn(game, "Grizzly Bears"));
    const sivitri = spawn(game, "Sivitri, Dragon Master", B);
    // Bob's effect, as his +1 on his own turn would leave it.
    game.state.playerEffects = [
      {
        owner: B,
        expires: { untilTurnOf: B },
        attackTax: { generic: 0, life: 2, covers: "you-and-planeswalkers" },
      },
    ];
    return { game, bears, sivitri, offer: toAttackers(game) };
  };

  it("is offered per defender and paid in life, not mana", () => {
    const { game, bears, sivitri, offer } = underSivitri(2);
    expect(offer.attackTax?.lifePerCreature?.[B]).toBe(2);
    expect(offer.attackTax?.lifePerCreature?.[sivitri]).toBe(2);
    expect(offer.attackTax?.perCreature[B]).toBeUndefined();
    expect(offer.attackTax?.lifeBudget).toBe(20);
    game.dispatch(declare(bears, B));
    expect(life(game)).toBe(16);
  });

  it("is paid for an attack on the planeswalker too", () => {
    const { game, bears, sivitri } = underSivitri(1);
    game.dispatch(declare(bears, sivitri));
    expect(game.state.objects[bears[0]].attacking).toBe(sivitri);
    expect(life(game)).toBe(18);
  });

  it("can't be paid with less life than it costs; can be with exactly that (rule 119.4)", () => {
    const short = underSivitri(2, 3);
    expect(short.game.canDispatch(declare(short.bears, B))).toMatch(/can't pay the 4 life/);
    const exact = underSivitri(2, 4);
    expect(exact.game.canDispatch(declare(exact.bears, B))).toBeNull();
    exact.game.dispatch(declare(exact.bears, B));
    expect(life(exact.game)).toBe(0);
    expect(exact.game.state.players[A].hasLost).toBe(true);
  });

  it("can't be paid by a player who can't lose life (rule 119.4b)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.playerEffects = [
      { owner: B, expires: { untilTurnOf: B }, attackTax: { generic: 0, life: 2, covers: "you" } },
    ];
    game.debugApplyEffect(A, { kind: "prohibit", prohibits: [{ act: "lose-life", who: "you" }] }, []);
    const offer = toAttackers(game);
    expect(offer.attackTax?.lifeBudget).toBe(0);
    expect(game.canDispatch(declare([bears], B))).toMatch(/can't pay the 2 life/);
    expect(withinAttackTax([{ attacker: bears, defender: B }], offer)).toEqual([]);
  });

  it("cuts a driver's declaration short of the last point of life", () => {
    const { bears, offer } = underSivitri(3, 5);
    const declared = bears.map((attacker) => ({ attacker, defender: B }));
    // 5 life: 2 creatures cost 4, leaving 1.
    expect(withinAttackTax(declared, offer)).toHaveLength(2);
    // 4 life: 2 would be payable and fatal.
    const { bears: others, offer: tight } = underSivitri(2, 4);
    expect(withinAttackTax(others.map((attacker) => ({ attacker, defender: B })), tight)).toHaveLength(1);
  });

  it("charges a token stack per token", () => {
    const { game } = table();
    const stack = spawn(game, "Grizzly Bears");
    game.state.objects[stack].stackCount = 3;
    game.state.playerEffects = [
      { owner: B, expires: { untilTurnOf: B }, attackTax: { generic: 0, life: 2, covers: "you" } },
    ];
    toAttackers(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: stack, defender: B, count: 2 }] });
    expect(life(game)).toBe(16);
  });

  it("isn't obligatory: a creature that must attack may stay home (rule 508.1d)", () => {
    const { game } = table();
    const juggernaut = spawn(game, "Juggernaut");
    game.state.playerEffects = [
      { owner: B, expires: { untilTurnOf: B }, attackTax: { generic: 0, life: 2, covers: "you" } },
    ];
    const offer = toAttackers(game);
    expect(offer.mustAttack).not.toContain(juggernaut);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).toBeNull();
    // A driver sends it where it's free, were there anywhere.
    expect(withRequiredAttackers([], offer)).toEqual([]);
  });
});

describe("an attack tax for a while", () => {
  it("Sivitri's +1 outlasts her, and ends as her controller's next turn begins", () => {
    const { game } = table();
    const sivitri = spawn(game, "Sivitri, Dragon Master", A);
    loyalty(game, sivitri, 1);
    expect(game.state.playerEffects?.[0]?.attackTax).toEqual({ generic: 0, life: 2, covers: "you-and-planeswalkers" });
    // Bob's turn, Sivitri gone: attacking alice still costs 2 life a creature.
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    game.state.objects[sivitri].counters.loyalty = 0;
    const bears = spawn(game, "Grizzly Bears", B);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    expect(zone(game, sivitri)).toBe("graveyard");
    const offer = game.legalActions(B).find((a): a is Offer => a.kind === "declare-attackers");
    expect(offer?.attackTax?.lifePerCreature?.[A]).toBe(2);
    game.dispatch({ type: "declare-attackers", player: B, attackers: [{ attacker: bears, defender: A }] });
    expect(life(game, B)).toBe(18);
    // Alice's next turn begins: over.
    nextTurn(game);
    expect(game.state.playerEffects?.some((e) => e.attackTax !== undefined) ?? false).toBe(false);
  });

  it("Forbidding Spirit's trigger taxes the player and their planeswalkers", () => {
    const { game } = table();
    enter(game, "Forbidding Spirit", B);
    const forests = lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perCreature[B]).toBe(2);
    expect(offer.attackTax?.perCreature[walker]).toBe(2);
    game.dispatch(declare([bears], walker));
    expect(untapped(game, forests)).toBe(0);
  });

  it("War Tax taxes every attack, its controller's own, with X fixed as it resolves", () => {
    const { game } = table();
    const war = spawn(game, "War Tax");
    lands(game, "Island", 7);
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    activate(game, war, 0, { x: 2 });
    expect(game.state.playerEffects?.[0]?.attackTax).toEqual({ generic: 2, life: 0, covers: "all" });
    activate(game, war, 0, { x: 1 });
    const offer = toAttackers(game);
    // Each activation adds up: {2} and {1}, on anything attacked.
    expect(offer.attackTax?.perCreature[B]).toBe(3);
    expect(offer.attackTax?.perCreature[walker]).toBe(3);
    expect(offer.attackTax?.budget).toBe(2);
    expect(game.canDispatch(declare([bears], B))).toMatch(/can't pay/);
  });

  it("War Tax lapses at end of turn", () => {
    const { game } = table();
    const war = spawn(game, "War Tax");
    lands(game, "Island", 2);
    activate(game, war, 0, { x: 1 });
    expect(game.state.playerEffects?.length).toBe(1);
    toStep(game, "precombat-main", B);
    expect(game.state.playerEffects?.length ?? 0).toBe(0);
  });
});
