/**
 * A cost to attack paid in permanents (`combatTax.permanents`, rule 508.1h):
 * Exalted Dragon and Leviathan sacrifice, Floodtide Serpent returns, Reclamation
 * taxes every black attacker. Chosen once the declaration is made, paid with the
 * rest of the costs (508.1j), never obliged by a requirement (508.1d), and a
 * declaration that can't pay is refused.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { withinAttackTax, withRequiredAttackers } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, lands, settle, spawn, table } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const ready = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  game.state.objects[id].tapped = false;
  return id;
};
const toAttackers = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  return game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers")!;
};
const attack = (game: Game, ...attackers: readonly ObjectId[]): void => {
  game.dispatch({
    type: "declare-attackers",
    player: A,
    attackers: attackers.map((attacker) => ({ attacker, defender: B })),
  });
};
const zoneOf = (game: Game, id: ObjectId): string | undefined => game.state.objects[id]?.zone;
const attacking = (game: Game, id: ObjectId): boolean => game.state.objects[id]?.attacking === B;

describe("a cost to attack paid in permanents", () => {
  it("asks which land once the declaration is made, then sacrifices it", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    const [keep, pay] = lands(game, "Forest", 2);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[dragon]?.[B]?.permanents?.[0]).toMatchObject({
      do: "sacrifice",
      count: 1,
      noun: "land",
      among: [keep, pay],
    });
    attack(game, dragon);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", player: A, count: 1 });
    expect(game.state.decisionSource?.cardName).toBe("Exalted Dragon");
    // Nothing is paid or announced until it's answered.
    expect(zoneOf(game, pay)).toBe("battlefield");
    game.dispatch({ type: "sacrifice", player: A, permanents: [pay] });
    expect(zoneOf(game, pay)).toBe("graveyard");
    expect(zoneOf(game, keep)).toBe("battlefield");
    expect(attacking(game, dragon)).toBe(true);
    expect(game.state.pendingAttackCost).toBeUndefined();
    expect(game.state.awaiting).toBeNull();
  });

  it("takes the only land without asking", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    const [only] = lands(game, "Forest", 1);
    toAttackers(game);
    attack(game, dragon);
    expect(game.state.awaiting).toBeNull();
    expect(zoneOf(game, only)).toBe("graveyard");
    expect(attacking(game, dragon)).toBe(true);
  });

  it("refuses the declaration with nothing to pay it", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    toAttackers(game);
    expect(() => attack(game, dragon)).toThrow(/can't sacrifice the land/);
    expect(attacking(game, dragon)).toBe(false);
  });

  it("sacrifices two Islands for Leviathan, and refuses one Island and a Forest", () => {
    const { game } = table();
    const leviathan = ready(game, "Leviathan");
    const [island] = lands(game, "Island", 1);
    lands(game, "Forest", 3);
    toAttackers(game);
    expect(() => attack(game, leviathan)).toThrow(/can't sacrifice the 2 Islands/);
    const [second, third] = lands(game, "Island", 2);
    attack(game, leviathan);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 2 });
    game.dispatch({ type: "sacrifice", player: A, permanents: [island, second] });
    expect(zoneOf(game, island)).toBe("graveyard");
    expect(zoneOf(game, second)).toBe("graveyard");
    expect(zoneOf(game, third)).toBe("battlefield");
    expect(attacking(game, leviathan)).toBe(true);
  });

  it("adds Reclamation's land up per black creature, one choice, whoever controls it", () => {
    const { game } = table();
    spawn(game, "Reclamation", B);
    const one = ready(game, "Vampire Nighthawk");
    const two = ready(game, "Vampire Nighthawk");
    const free = ready(game, "Grizzly Bears");
    const pool = lands(game, "Swamp", 3);
    toAttackers(game);
    attack(game, one, two, free);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", player: A, count: 2 });
    game.dispatch({ type: "sacrifice", player: A, permanents: [pool[0], pool[2]] });
    expect(pool.map((id) => zoneOf(game, id))).toEqual(["graveyard", "battlefield", "graveyard"]);
    for (const id of [one, two, free]) expect(attacking(game, id)).toBe(true);
  });

  it("leaves a creature it doesn't reach free", () => {
    const { game } = table();
    spawn(game, "Reclamation", B);
    const green = ready(game, "Grizzly Bears");
    const [land] = lands(game, "Forest", 1);
    const offer = toAttackers(game);
    expect(offer.attackTax).toBeUndefined();
    attack(game, green);
    expect(zoneOf(game, land)).toBe("battlefield");
    expect(attacking(game, green)).toBe(true);
  });

  it("returns an enchantment to its owner's hand for Floodtide Serpent", () => {
    const { game } = table();
    const serpent = ready(game, "Floodtide Serpent");
    const first = spawn(game, "Propaganda", A);
    const second = spawn(game, "Ghostly Prison", A);
    toAttackers(game);
    attack(game, serpent);
    expect(game.state.awaiting).toMatchObject({ kind: "choose-permanents", min: 1, max: 1, attackCost: true });
    game.dispatch({ type: "choose-permanents", player: A, permanents: [second] });
    expect(zoneOf(game, second)).toBe("hand");
    expect(zoneOf(game, first)).toBe("battlefield");
    expect(attacking(game, serpent)).toBe(true);
  });

  it("pays mana first, so a land can tap for the mana and then be sacrificed", () => {
    const { game } = table();
    spawn(game, "Propaganda", B);
    const dragon = ready(game, "Exalted Dragon");
    const pool = lands(game, "Plains", 2);
    toAttackers(game);
    attack(game, dragon);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 1 });
    expect(pool.every((id) => game.state.objects[id].tapped)).toBe(true);
    game.dispatch({ type: "sacrifice", player: A, permanents: [pool[0]] });
    expect(zoneOf(game, pool[0])).toBe("graveyard");
    expect(attacking(game, dragon)).toBe(true);
  });

  it("one permanent never pays two costs: a land is offered only if the rest stays payable", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    const leviathan = ready(game, "Leviathan");
    const islands = lands(game, "Island", 2);
    const [forest] = lands(game, "Forest", 1);
    toAttackers(game);
    // Three lands in all, two of them the Islands Leviathan needs: the Dragon's
    // land has to be the Forest, so no question is asked.
    attack(game, dragon, leviathan);
    expect(game.state.awaiting).toBeNull();
    expect([forest, ...islands].map((id) => zoneOf(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(attacking(game, dragon) && attacking(game, leviathan)).toBe(true);
  });

  it("isn't paid twice over by a land one too few: three costs on two lands is refused", () => {
    const { game } = table();
    spawn(game, "Reclamation", B);
    const one = ready(game, "Vampire Nighthawk");
    const two = ready(game, "Vampire Nighthawk");
    const three = ready(game, "Vampire Nighthawk");
    lands(game, "Swamp", 2);
    toAttackers(game);
    expect(() => attack(game, one, two, three)).toThrow(/can't sacrifice the 3 lands/);
  });

  it("a creature that paid with itself is no attacker, and the attack isn't announced with it", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    // A land creature, attacking, and the only land to sacrifice (rule 508.1k).
    const arbor = ready(game, "Dryad Arbor");
    toAttackers(game);
    attack(game, dragon, arbor);
    expect(zoneOf(game, arbor)).toBe("graveyard");
    expect(attacking(game, dragon)).toBe(true);
    expect(game.state.players[A].turnHistory?.attackedPower?.power).toBe(5);
    settle(game);
  });

  it("never obliges a requirement to pay, and a driver keeps its lands", () => {
    const { game } = table();
    const dragon = ready(game, "Exalted Dragon");
    lands(game, "Plains", 3);
    const offer = toAttackers(game);
    expect(offer.mustAttack).not.toContain(dragon);
    const wanted = [{ attacker: dragon, defender: B }];
    // Three lands: a driver that doesn't weigh the cost keeps them.
    expect(withinAttackTax(wanted, offer)).toEqual([]);
    expect(withRequiredAttackers(wanted, offer)).toEqual([]);
    lands(game, "Plains", 1);
    const more = game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers")!;
    expect(withinAttackTax(wanted, more)).toEqual(wanted);
  });

  it("doesn't bind a creature that must attack to pay (rule 508.1d)", () => {
    const { game } = table();
    const forced = ready(game, "Exalted Dragon");
    game.state.objects[forced].goadedForGameBy = [B];
    const [land] = lands(game, "Swamp", 1);
    const offer = toAttackers(game);
    expect(offer.attackTax?.perAttacker?.[forced]?.[B]?.permanents).toHaveLength(1);
    expect(offer.mustAttack).not.toContain(forced);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [] });
    expect(game.state.objects[forced].attacking).toBeNull();
    expect(zoneOf(game, land)).toBe("battlefield");
  });

  it("Leviathan enters tapped, stays so, and its upkeep sacrifice of two Islands untaps it", () => {
    const { game } = table();
    const leviathan = enter(game, "Leviathan");
    expect(game.state.objects[leviathan].tapped).toBe(true);
    const islands = lands(game, "Island", 3);
    // Past alice's own next untap step, to the trigger at her upkeep.
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.turn.number > turn + 1 && s.awaiting?.kind === "choose-modes");
    expect(game.state.turn.step).toBe("upkeep");
    expect(game.state.objects[leviathan].tapped).toBe(true);
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 2 });
    game.dispatch({ type: "sacrifice", player: A, permanents: [islands[0], islands[2]] });
    settle(game);
    expect(game.state.objects[leviathan].tapped).toBe(false);
    expect(islands.map((id) => zoneOf(game, id))).toEqual(["graveyard", "battlefield", "graveyard"]);
  });
});
