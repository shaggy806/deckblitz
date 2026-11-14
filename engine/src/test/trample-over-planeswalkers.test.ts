/**
 * Trample over planeswalkers (rule 702.19c — Thrasta, Tempest's Roar): an
 * attacker attacking a planeswalker assigns lethal to its blockers, then the
 * planeswalker's loyalty — counting what the other attackers assign it this
 * step — and may send the rest on to the planeswalker's controller: one
 * amount more on the `assign-combat-damage` answer (`overPlaneswalker`),
 * asked even of an unblocked attacker. A planeswalker removed from combat
 * leaves its damage to the defending player (702.19e).
 */
import { describe, expect, it } from "vitest";

import type { BlockerDeclaration, LegalAction } from "../actions.js";
import { invalidateComputedCache } from "../characteristics.js";
import { damageAssignmentViolations, standardAssignment } from "../combat/damage.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, attack, cast, destroy, lands, life, spawn, table, toHand, toStep, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "assign-combat-damage" }>;

const blocks = (attacker: ObjectId, ...blockers: ObjectId[]): (() => BlockerDeclaration[]) => () =>
  blockers.map((blocker) => ({ blocker, attacker }));

/** Bob's planeswalker with `loyalty` loyalty counters. */
function walker(game: Game, loyalty: number): ObjectId {
  const pw = spawn(game, "Jace Beleren", B);
  game.state.objects[pw].counters.loyalty = loyalty;
  invalidateComputedCache();
  return pw;
}

describe("trample over planeswalkers", () => {
  it("unblocked, sends what's past the planeswalker's loyalty on to its controller", () => {
    const { game, a } = table();
    const thrasta = spawn(game, "Thrasta, Tempest's Roar");
    const pw = walker(game, 3);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = (view, ask) => {
      offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return standardAssignment(ask);
    };
    attack(game, a, [thrasta], pw);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ blockers: [], power: 7, overPlaneswalker: { planeswalker: pw, player: B, loyaltyLeft: 3 } });
    expect(zone(game, pw)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("may keep it all on the planeswalker", () => {
    const { game, a } = table();
    const thrasta = spawn(game, "Thrasta, Tempest's Roar");
    const pw = walker(game, 3);
    a.assignCombatDamageFn = () => [0];
    attack(game, a, [thrasta], pw);
    expect(zone(game, pw)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("blocked by a 3/3 attacking a two-loyalty planeswalker: 3, 2 and 2 (the ruling)", () => {
    const { game, a, b } = table();
    const thrasta = spawn(game, "Thrasta, Tempest's Roar");
    const pw = walker(game, 2);
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = blocks(thrasta, giant);
    attack(game, a, [thrasta], pw);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, pw)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("counts another attacker's damage to the planeswalker (a 2/2 beside it, seven loyalty: 5 and 2)", () => {
    const { game, a } = table();
    const thrasta = spawn(game, "Thrasta, Tempest's Roar");
    const bears = spawn(game, "Grizzly Bears");
    const pw = walker(game, 7);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = (view, ask) => {
      offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return standardAssignment(ask);
    };
    a.declareAttackersFn = () => [
      { attacker: thrasta, defender: pw },
      { attacker: bears, defender: pw },
    ];
    toStep(game, "postcombat-main");
    expect(offers[0]?.overPlaneswalker?.loyaltyLeft).toBe(5);
    expect(zone(game, pw)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("refuses sending damage on before the planeswalker has its loyalty, or the blockers lethal", () => {
    const offer = {
      blockers: ["x" as ObjectId],
      power: 7,
      lethal: [3],
      trample: true,
      overPlaneswalker: { planeswalker: "pw" as ObjectId, player: B, loyaltyLeft: 2 },
    };
    expect(damageAssignmentViolations(offer, [3, 2])).toBeNull();
    expect(damageAssignmentViolations(offer, [3, 3])).toMatch(/loyalty/);
    expect(damageAssignmentViolations(offer, [2, 1])).toMatch(/lethal/);
    expect(damageAssignmentViolations(offer, [3])).toMatch(/expected/);
  });

  it("a planeswalker blocking the attacker attacking it needs lethal or its loyalty, whichever is greater", () => {
    const offer = {
      blockers: ["pw" as ObjectId],
      power: 7,
      lethal: [3],
      trample: true,
      overPlaneswalker: { planeswalker: "pw" as ObjectId, player: B, loyaltyLeft: 4, blockerIndex: 0 },
    };
    expect(standardAssignment(offer)).toEqual([3, 3]);
    expect(damageAssignmentViolations(offer, [4, 3])).toBeNull();
    expect(damageAssignmentViolations(offer, [3, 4])).toMatch(/loyalty/);
  });

  it("with the planeswalker gone before damage, deals its damage to the defending player (702.19e)", () => {
    const { game, a } = table();
    const thrasta = spawn(game, "Thrasta, Tempest's Roar");
    const pw = walker(game, 3);
    a.declareAttackersFn = () => [{ attacker: thrasta, defender: pw }];
    toStep(game, "declare-blockers");
    destroy(game, pw);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(13);
  });

  it("a plain trampler attacking a planeswalker sends nothing on", () => {
    const { game, a } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const pw = walker(game, 3);
    let asked = 0;
    a.assignCombatDamageFn = (_view, ask) => {
      asked += 1;
      return standardAssignment(ask);
    };
    attack(game, a, [dreadmaw], pw);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20);
    expect(zone(game, pw)).toBe("graveyard");
  });
});

describe("Thrasta, Tempest's Roar", () => {
  it("costs {3} less for each other spell cast this turn", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Llanowar Elves"));
    cast(game, toHand(game, "Llanowar Elves"));
    cast(game, toHand(game, "Thrasta, Tempest's Roar"));
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === "Thrasta, Tempest's Roar")).toBe(true);
  });
});
