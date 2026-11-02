/**
 * A can't-attack restriction scoped to the defender (rule 508.1b, 508.1c):
 * "can't attack you" naming the player alone, not their planeswalkers (Reverence,
 * Blazing Archon, Teferi's Moat, Queen Mother Ramonda, Elephant Grass); for a
 * while (Chronomantic Escape); and "a player it has already attacked this turn"
 * (Port Razer, Bloodthirster). Elephant Grass's and Heat Wave's other halves are
 * `combatTax` narrowed by colour.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defendersForAttacker, whyCannotAttack } from "../combat/eligibility.js";
import { withinBlockTax } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, cast, lands, nextTurn, registryOf, settle, spawn, table, toHand, toStep } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
type BlockOffer = Extract<LegalAction, { kind: "declare-blockers" }>;

const ready = (game: Game, name: string, player = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  game.state.objects[id].tapped = false;
  return id;
};
const can = (game: Game, attacker: ObjectId, defender: PlayerId | ObjectId): boolean =>
  whyCannotAttack(game.state, registryOf(game), A, attacker, defender) === null;
const toAttackers = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  return game.legalActions(A).find((a): a is AttackOffer => a.kind === "declare-attackers")!;
};

describe("can't attack you", () => {
  it("binds only what it names, and leaves your planeswalkers (Reverence)", () => {
    const { game } = table();
    spawn(game, "Reverence", B);
    const walker = spawn(game, "Jace Beleren", B);
    const small = ready(game, "Grizzly Bears");
    const big = ready(game, "Hill Giant");
    expect(can(game, small, B)).toBe(false);
    expect(can(game, small, walker)).toBe(true);
    expect(can(game, big, B)).toBe(true);
    expect(defendersForAttacker(game.state, registryOf(game), A, small)).toEqual([walker]);
  });

  it("names its controller, not other players", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Blazing Archon", B);
    const bears = ready(game, "Grizzly Bears");
    expect(can(game, bears, B)).toBe(false);
    expect(can(game, bears, C)).toBe(true);
  });

  it("still covers planeswalkers in the form that names them", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    const bears = ready(game, "Grizzly Bears");
    spawn(game, "Vow of Duty", B);
    const vow = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Vow of Duty")!;
    game.state.objects[vow].attachedTo = bears;
    expect(can(game, bears, B)).toBe(false);
    expect(can(game, bears, walker)).toBe(false);
  });

  it("reads the colour chosen, and flying (Teferi's Moat)", () => {
    const { game } = table();
    const moat = spawn(game, "Teferi's Moat", B);
    game.state.objects[moat].chosenOnEnter = "G";
    const green = ready(game, "Grizzly Bears");
    const greenFlier = ready(game, "Giant Spider");
    const white = ready(game, "Savannah Lions");
    expect(can(game, green, B)).toBe(false);
    expect(can(game, white, B)).toBe(true);
    // Reach isn't flying.
    expect(can(game, greenFlier, B)).toBe(false);
  });

  it("holds only while its condition does (Queen Mother Ramonda)", () => {
    const { game } = table();
    spawn(game, "Queen Mother Ramonda", B);
    const bears = ready(game, "Grizzly Bears");
    expect(can(game, bears, B)).toBe(true);
    game.state.monarch = B;
    expect(can(game, bears, B)).toBe(false);
    game.state.monarch = A;
    expect(can(game, bears, B)).toBe(true);
  });

  it("taxes one colour and forbids the other (Elephant Grass)", () => {
    const { game } = table();
    spawn(game, "Elephant Grass", B);
    const walker = spawn(game, "Jace Beleren", B);
    const black = ready(game, "Vampire Nighthawk");
    const green = ready(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const offer = toAttackers(game);
    expect(offer.defendersFor[black]).toEqual([walker]);
    expect(offer.attackTax?.perAttacker?.[green]?.[B]).toEqual({ generic: 2, life: 0 });
    expect(offer.attackTax?.perAttacker?.[green]?.[walker]).toBeUndefined();
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: green, defender: B }] });
    expect(game.state.objects[green].attacking).toBe(B);
  });
});

describe("until your next turn, creatures can't attack you", () => {
  it("binds creatures arriving later, leaves planeswalkers, and ends (Chronomantic Escape)", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const escape = toHand(game, "Chronomantic Escape");
    cast(game, escape);
    expect(game.state.objects[escape].zone).toBe("exile");
    expect(game.state.objects[escape].counters.time).toBe(3);
    const walker = spawn(game, "Jace Beleren");
    nextTurn(game);
    const later = spawn(game, "Grizzly Bears", B);
    game.state.objects[later].summoningSick = false;
    expect(whyCannotAttack(game.state, registryOf(game), B, later, A)).toMatch(/can't attack/);
    expect(whyCannotAttack(game.state, registryOf(game), B, later, walker)).toBeNull();
    // Alice's next turn begins: over.
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(whyCannotAttack(game.state, registryOf(game), B, later, A)).toBeNull();
  });
});

describe("can't attack a player it has already attacked this turn", () => {
  it("leaves another player and their planeswalkers for the extra combat, and resets (Port Razer)", () => {
    const { game, a } = table({ players: 3 });
    const razer = ready(game, "Port Razer");
    const walker = spawn(game, "Jace Beleren", B);
    let declared = 0;
    let second: readonly (PlayerId | ObjectId)[] = [];
    a.declareAttackersFn = (view) => {
      declared += 1;
      const offer = view.legalActions().find((o): o is AttackOffer => o.kind === "declare-attackers");
      if (declared === 2) second = offer?.defendersFor[razer] ?? [];
      return declared === 1 ? [{ attacker: razer, defender: B }] : [];
    };
    toStep(game, "postcombat-main");
    settle(game);
    expect(declared).toBe(2);
    expect(second).not.toContain(B);
    expect(second).toContain(C);
    expect(second).toContain(walker);
    expect(game.state.objects[razer].attackedPlayersThisTurn).toEqual([B]);
    nextTurn(game);
    expect(game.state.objects[razer].attackedPlayersThisTurn).toBeUndefined();
  });

  it("isn't asked again with no player left to attack, two-handed (Bloodthirster)", () => {
    const { game, a } = table();
    const demon = ready(game, "Bloodthirster");
    let declared = 0;
    a.declareAttackersFn = () => {
      declared += 1;
      return declared === 1 ? [{ attacker: demon, defender: B }] : [];
    };
    toStep(game, "postcombat-main");
    settle(game);
    expect(game.state.players[B].life).toBe(14);
    expect(game.state.objects[demon].tapped).toBe(false);
    expect(whyCannotAttack(game.state, registryOf(game), A, demon, B)).toMatch(/already attacked/);
  });

  it("doesn't count a planeswalker it attacked as the player", () => {
    const { game } = table();
    const razer = ready(game, "Port Razer");
    const walker = spawn(game, "Jace Beleren", B);
    toAttackers(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: razer, defender: walker }] });
    expect(game.state.objects[razer].attackedPlayersThisTurn).toBeUndefined();
  });
});

describe("a block tax by colour (Heat Wave)", () => {
  const toBlocks = (game: Game, attacker: ObjectId): BlockOffer => {
    toAttackers(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.result.over);
    return game.legalActions(B).find((a): a is BlockOffer => a.kind === "declare-blockers")!;
  };

  it("bars blue, and charges anything else 1 life a blocker", () => {
    const { game } = table();
    spawn(game, "Heat Wave");
    const attacker = ready(game, "Grizzly Bears");
    const blue = ready(game, "Coral Merfolk", B);
    const green = ready(game, "Grizzly Bears", B);
    const before = game.state.players[B].life;
    const offer = toBlocks(game, attacker);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([green]);
    expect(offer.blockTax?.onBlocker?.[green]).toEqual([{ generic: 0, life: 1, attackers: [attacker] }]);
    expect(blue).toBeDefined();
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: green, attacker }] });
    expect(game.state.players[B].life).toBe(before - 1);
  });

  it("stops a driver short of its last point of life", () => {
    const { game } = table({ life: 1 });
    spawn(game, "Heat Wave");
    const attacker = ready(game, "Grizzly Bears");
    const green = ready(game, "Grizzly Bears", B);
    const offer = toBlocks(game, attacker);
    expect(withinBlockTax([{ blocker: green, attacker }], offer)).toEqual([]);
  });
});
