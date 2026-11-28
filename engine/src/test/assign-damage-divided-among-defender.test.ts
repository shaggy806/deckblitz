/**
 * "You may assign this creature's combat damage divided as you choose among
 * defending player and/or any number of creatures they control" — the
 * `divideCombatDamageAmongDefender` static, answered on the
 * `assign-combat-damage` decision in two questions: `mayDivide` (the action's
 * `divide`), blocked or not, then `dividing`, whose `blockers` are every
 * creature the defending player controls and whose rest goes to that player
 * (rule 510.1). Butcher Orgg is the proving card:
 *
 * - unblocked: asked, and the division kills a creature that never blocked;
 * - blocked: the division may skip its blocker for another creature;
 * - declined: its damage goes as usual (to the player, or its blocker);
 * - blocked with every blocker gone: no combat damage, so no question (its
 *   ruling);
 * - four players: the defending player is the one it attacks, and only their
 *   creatures are offered;
 * - the automatic answers: divide when attacking a player, and all to the
 *   player when that's lethal, otherwise the standard kills and the rest to
 *   the player.
 */
import { describe, expect, it } from "vitest";

import type { BlockerDeclaration, LegalAction } from "../actions.js";
import { AutomaticController } from "../controller.js";
import type { ControllerView, DamageAnswer, DamageAssignmentAsk } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, destroy, life, spawn, table, toStep, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "assign-combat-damage" }>;

const blocks = (attacker: ObjectId, ...blockers: ObjectId[]): (() => BlockerDeclaration[]) => () =>
  blockers.map((blocker) => ({ blocker, attacker }));

/** Says yes to dividing, then gives each creature `amounts[id]`. */
const divideAs =
  (amounts: Readonly<Record<string, number>>, offers: Offer[] = []) =>
  (view: ControllerView, ask: DamageAssignmentAsk): DamageAnswer => {
    offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
    if (ask.mayDivide !== undefined) return "divide";
    return ask.blockers.map((id) => amounts[id] ?? 0);
  };

describe("Butcher Orgg", () => {
  it("unblocked, divides its damage among the defending player and a creature that isn't blocking", () => {
    const { game, a } = table();
    const orgg = spawn(game, "Butcher Orgg");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = divideAs({ [giant]: 3 }, offers);
    attack(game, a, [orgg]);
    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({ mayDivide: B, blockers: [], power: 6 });
    expect(offers[1]).toMatchObject({ dividing: B, blockers: [bears, giant], lethal: [2, 3] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });

  it("blocked, may put its damage on a creature other than its blocker", () => {
    const { game, a, b } = table();
    const orgg = spawn(game, "Butcher Orgg");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = blocks(orgg, bears);
    a.assignCombatDamageFn = divideAs({ [giant]: 6 });
    attack(game, a, [orgg]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    // Still blocked: the Bears dealt it their damage.
    expect(game.state.objects[orgg].damageMarked).toBe(2);
  });

  it("declined, unblocked it deals all of it to the player, and blocked all of it to its blocker", () => {
    const { game, a } = table();
    const orgg = spawn(game, "Butcher Orgg");
    const giant = spawn(game, "Hill Giant", B);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = (view, ask) => {
      offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return ask.mayDivide !== undefined ? [] : ask.blockers.map(() => 0);
    };
    attack(game, a, [orgg]);
    expect(offers).toHaveLength(1);
    expect(life(game, B)).toBe(14);
    expect(zone(game, giant)).toBe("battlefield");

    const other = table();
    const orgg2 = spawn(other.game, "Butcher Orgg");
    const bears = spawn(other.game, "Grizzly Bears", B);
    other.b.declareBlockersFn = blocks(orgg2, bears);
    attack(other.game, other.a, [orgg2]);
    expect(zone(other.game, bears)).toBe("graveyard");
    expect(life(other.game, B)).toBe(20);
  });

  it("blocked with its blocker gone, deals no combat damage and isn't asked", () => {
    const { game, a, b } = table();
    const orgg = spawn(game, "Butcher Orgg");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = blocks(orgg, bears);
    a.declareAttackersFn = () => [{ attacker: orgg, defender: B }];
    const offers: Offer[] = [];
    a.assignCombatDamageFn = divideAs({ [giant]: 6 }, offers);
    toStep(game, "declare-blockers");
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(offers).toHaveLength(0);
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("with four players, offers only the attacked player's creatures", () => {
    const { game, a } = table({ players: 4 });
    const orgg = spawn(game, "Butcher Orgg");
    spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", C);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = divideAs({ [giant]: 3 }, offers);
    attack(game, a, [orgg], C);
    expect(offers[1]).toMatchObject({ dividing: C, blockers: [giant] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, C)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("the automatic answers: divide when attacking a player; all to the player when that's lethal", () => {
    const { game } = table();
    const orgg = spawn(game, "Butcher Orgg");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const bot = new AutomaticController(A);
    const view = { state: game.state, player: A, legalActions: () => [] } as unknown as ControllerView;
    game.state.objects[orgg].attacking = B;
    const base = { attacker: orgg, power: 6, trample: false } as const;
    expect(bot.assignCombatDamage(view, { ...base, blockers: [], lethal: [], indestructible: [], mayDivide: B })).toBe(
      "divide",
    );
    const division: DamageAssignmentAsk = {
      ...base,
      blockers: [bears, giant],
      lethal: [2, 3],
      indestructible: [false, false],
      dividing: B,
    };
    // Both killed, the last 1 to the player.
    expect(bot.assignCombatDamage(view, division)).toEqual([2, 3]);
    game.state.players[B].life = 6;
    expect(bot.assignCombatDamage(view, division)).toEqual([0, 0]);
  });
});
