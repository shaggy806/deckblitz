/**
 * "Choose target player and any number of target attacking creatures their
 * opponents control. Those creatures are now attacking that player" (Portal
 * Manipulator): `reselect-attack`'s `to` (rule 508.7, no choice left), and
 * `differentController` against a player's slot — the player itself is that
 * slot's player, so a creature that player controls isn't a legal target,
 * for every member of the group (`concreteTargetSpecs`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import type { TargetSpec } from "../target.js";
import { concreteTargetSpecs } from "../target.js";
import { invalidTargetReason } from "../targeting.js";
import { A, B, C, D, cast, lands, life, pickTargets, ref, spawn, table, toHand, toStep } from "./harness.js";

const toAttackersPriority = (game: Game, player: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === player);

/** Portal Manipulator's trigger's target list. */
function manipulatorTargets(game: Game): readonly TargetSpec[] {
  return game.registry.get("Portal Manipulator").triggered[0].targets;
}

describe("Portal Manipulator", () => {
  it("sends the chosen attackers at the target player, with no question asked", () => {
    const { game, a, b } = table({ players: 4 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    lands(game, "Plains", 4, B);
    const manipulator = toHand(game, "Portal Manipulator", B);
    toAttackersPriority(game, B);
    pickTargets(b, D, giant, bears);
    cast(game, manipulator, { player: B });
    expect(game.state.awaiting).toBe(null);
    expect(game.state.objects[giant].attacking).toBe(D);
    expect(game.state.objects[bears].attacking).toBe(D);
    // Never declared again (508.7a): one declaration each, and each still
    // attacked what it was declared at.
    expect(game.state.eventLog.filter((e) => e.type === "attacker-declared")).toHaveLength(2);
    expect(game.state.objects[giant].attackedPlayersThisTurn).toEqual([B]);
    const [bob, carol, dave] = [life(game, B), life(game, C), life(game, D)];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(bob);
    expect(life(game, C)).toBe(carol);
    expect(life(game, D)).toBe(dave - 5);
  });

  it("leaves an attacker it didn't target where it was", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    lands(game, "Plains", 4, B);
    const manipulator = toHand(game, "Portal Manipulator", B);
    toAttackersPriority(game, B);
    pickTargets(b, C, giant);
    cast(game, manipulator, { player: B });
    expect(game.state.objects[giant].attacking).toBe(C);
    expect(game.state.objects[bears].attacking).toBe(B);
  });

  it("takes an attacker off a planeswalker and onto the player", () => {
    const { game, a, b } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    const walker = spawn(game, "Jace Beleren", B);
    a.declareAttackersFn = () => [{ attacker: giant, defender: walker }];
    lands(game, "Plains", 4, B);
    const manipulator = toHand(game, "Portal Manipulator", B);
    toAttackersPriority(game, B);
    pickTargets(b, C, giant);
    cast(game, manipulator, { player: B });
    expect(game.state.objects[giant].attacking).toBe(C);
  });

  it("can't target a creature the target player controls — the first member or any after it", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    toAttackersPriority(game, A);
    const specs = manipulatorTargets(game);
    const judge = (...chosen: Parameters<typeof ref>[0][]): string | null =>
      invalidTargetReason(game.state, game.registry, specs, chosen.map(ref), B, "Portal Manipulator");
    // Alice's attackers: her opponents are Bob and Carol, never herself.
    expect(judge(C, giant, bears)).toBe(null);
    expect(judge(A, giant)).not.toBe(null);
    expect(judge(A, giant, bears)).not.toBe(null);
    // A later member the target player controls, after a legal first one: an
    // attacker of Carol's, set by hand (only the active player's attack).
    const elves = spawn(game, "Llanowar Elves", C);
    game.state.objects[elves].attacking = B;
    expect(judge(B, giant, elves)).toBe(null);
    expect(judge(C, giant, elves)).not.toBe(null);
    expect(judge(C, elves, giant)).not.toBe(null);
    // Two members one player controls are fine: not "different controllers".
    const concrete = concreteTargetSpecs(specs, [ref(C), ref(giant), ref(bears)]);
    expect(concrete[2]).toMatchObject({ kind: "other", than: { slots: [0, 1] }, differentController: { slots: [0] } });
  });

  it("doesn't trigger outside the declare attackers step", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 4);
    const manipulator = toHand(game, "Portal Manipulator");
    cast(game, manipulator);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.pendingTriggers).toEqual([]);
  });
});

describe("differentController against a player's slot", () => {
  it("keeps Protector of the Wastes' reading between two permanents", () => {
    const specs: TargetSpec[] = [
      "creature",
      { kind: "other", of: "creature", than: { slots: [0] }, differentController: true },
    ];
    const { game } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", C);
    const judge = (...chosen: Parameters<typeof ref>[0][]): string | null =>
      invalidTargetReason(game.state, game.registry, specs, chosen.map(ref), A, "test");
    expect(judge(giant, elves)).toBe(null);
    expect(judge(giant, bears)).not.toBe(null);
  });
});
