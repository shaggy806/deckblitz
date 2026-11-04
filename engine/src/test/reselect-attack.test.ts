/**
 * "You may reselect which player or permanent … is attacking" (rule 508.7), the
 * `reselect-attack` effect: the effect's controller answers the `enter-attacking`
 * decision among what the creature's controller could attack, what it's attacking
 * now first, so that staying is an answer.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { EnterAttackingChoice } from "../state.js";
import { A, B, C, D, activate, cast, counters, enter, lands, life, pickTargets, spawn, table, toHand, toStep } from "./harness.js";

const toAttackersPriority = (game: Game, player: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === player);

/** `seat` answers: `to[creature]`, or stays. Returns what was offered. */
const answering = (
  seat: ScriptedController,
  to: Record<ObjectId, PlayerId | ObjectId>,
): { offered: EnterAttackingChoice[] } => {
  const log: { offered: EnterAttackingChoice[] } = { offered: [] };
  seat.chooseAttackTargetsFn = (_view, creatures) => {
    log.offered.push(...creatures);
    return creatures.map((c) => ({ object: c.object, target: to[c.object] ?? c.options[0] }));
  };
  return log;
};

describe("Misleading Signpost", () => {
  it("sends an attacker on you at another player instead, in a multiplayer game", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3, B);
    const signpost = toHand(game, "Misleading Signpost", B);
    const log = answering(b, { [giant]: C });
    toAttackersPriority(game, B);
    pickTargets(b, giant);
    cast(game, signpost, { player: B });
    expect(log.offered[0].options[0]).toBe(B);
    expect(log.offered[0].options).toContain(C);
    expect(log.offered[0].options).not.toContain(A);
    expect(game.state.objects[giant].attacking).toBe(C);
    const [bob, carol] = [life(game, B), life(game, C)];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(bob);
    expect(life(game, C)).toBe(carol - 3);
  });

  it("leaves it where it is if you say so, and without an attack it does nothing", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3, B);
    const signpost = toHand(game, "Misleading Signpost", B);
    answering(b, {});
    toAttackersPriority(game, B);
    pickTargets(b, giant);
    cast(game, signpost, { player: B });
    expect(game.state.objects[giant].attacking).toBe(B);
    expect(game.state.eventLog.some((e) => e.type === "attack-reselected")).toBe(false);
  });

  it("isn't declared again: no 'attacks' trigger, and it still attacked what it was declared at (508.7a)", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3, B);
    const signpost = toHand(game, "Misleading Signpost", B);
    answering(b, { [giant]: C });
    toAttackersPriority(game, B);
    pickTargets(b, giant);
    cast(game, signpost, { player: B });
    expect(game.state.eventLog.filter((e) => e.type === "attacker-declared")).toHaveLength(1);
    expect(game.state.objects[giant].attackedPlayersThisTurn).toEqual([B]);
    expect(game.state.objects[giant].lastAttack?.player).toBe(B);
  });

  it("offers a planeswalker the attacking creature's opponents control (508.7c)", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const walker = spawn(game, "Jace Beleren", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3, B);
    const signpost = toHand(game, "Misleading Signpost", B);
    answering(b, { [giant]: walker });
    toAttackersPriority(game, B);
    pickTargets(b, giant);
    cast(game, signpost, { player: B });
    expect(game.state.objects[giant].attacking).toBe(walker);
  });

  it("isn't a question when there's nowhere else to send it", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3, B);
    const signpost = toHand(game, "Misleading Signpost", B);
    toAttackersPriority(game, B);
    pickTargets(b, giant);
    cast(game, signpost, { player: B });
    expect(game.state.awaiting).toBe(null);
    expect(game.state.objects[giant].attacking).toBe(B);
  });

  it("does nothing outside the declare attackers step: there's no trigger", () => {
    const { game } = table();
    enter(game, "Misleading Signpost");
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.pendingTriggers).toEqual([]);
  });
});

describe("Windshaper Planetar", () => {
  it("asks about every attacker at once, and needs no target", () => {
    const { game, a, b } = table({ players: 4 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    lands(game, "Plains", 5, B);
    const planetar = toHand(game, "Windshaper Planetar", B);
    const log = answering(b, { [giant]: D, [bears]: D });
    toAttackersPriority(game, B);
    cast(game, planetar, { player: B });
    expect(log.offered.map((c) => c.object).sort()).toEqual([giant, bears].sort());
    expect(game.state.objects[giant].attacking).toBe(D);
    expect(game.state.objects[bears].attacking).toBe(D);
  });
});

describe("Capricopian", () => {
  it("whoever it attacks pays, puts a counter on it, and sends it at another player", () => {
    const { game, a, b } = table({ players: 3 });
    const goat = enter(game, "Capricopian");
    game.state.objects[goat].counters = { "+1/+1": 2 };
    game.state.objects[goat].summoningSick = false;
    a.declareAttackersFn = () => [{ attacker: goat, defender: B }];
    lands(game, "Island", 2, B);
    answering(b, { [goat]: C });
    toAttackersPriority(game, B);
    // A real window for them, not a pass: the room only stops for what's offered.
    expect(game.isDeadForMana(B)).toBe(false);
    activate(game, goat, 0, { player: B });
    expect(counters(game, goat)).toBe(3);
    expect(game.state.objects[goat].attacking).toBe(C);
  });

  it("no one else may: not its controller, nor a player it isn't attacking", () => {
    const { game, a } = table({ players: 3 });
    const goat = enter(game, "Capricopian");
    game.state.objects[goat].counters = { "+1/+1": 2 };
    game.state.objects[goat].summoningSick = false;
    a.declareAttackersFn = () => [{ attacker: goat, defender: B }];
    lands(game, "Island", 2);
    lands(game, "Island", 2, C);
    toAttackersPriority(game, A);
    expect(() => activate(game, goat, 0, { player: A })).toThrow();
    toAttackersPriority(game, C);
    expect(() => activate(game, goat, 0, { player: C })).toThrow();
  });

  it("never offers a planeswalker: 'which player'", () => {
    const { game, a, b } = table({ players: 3 });
    const goat = enter(game, "Capricopian");
    game.state.objects[goat].counters = { "+1/+1": 2 };
    game.state.objects[goat].summoningSick = false;
    const walker = spawn(game, "Jace Beleren", C);
    a.declareAttackersFn = () => [{ attacker: goat, defender: B }];
    lands(game, "Island", 2, B);
    const log = answering(b, {});
    toAttackersPriority(game, B);
    activate(game, goat, 0, { player: B });
    expect(log.offered[0].options).toEqual([B, C]);
    expect(log.offered[0].options).not.toContain(walker);
  });
});
