/**
 * "You may have this creature assign its combat damage as though it weren't
 * blocked" — the `assignAsThoughUnblocked` static and the
 * `assign-as-though-unblocked` effect, answered on the `assign-combat-damage`
 * decision (`mayUnblocked`, the action's `asThoughUnblocked`):
 *
 * - Thorn Elemental: its own static. Asked even with one blocker and no
 *   trample, and even once every blocker has left combat; all of it to the
 *   player, or none.
 * - Indomitable Might: the Aura's rule for the enchanted creature.
 * - Siege Behemoth: every creature you control, while it's attacking.
 * - Outmaneuver: mandatory, on "X target blocked creatures" (the `blocked`
 *   filter) — no question asked.
 * - Predatory Focus: a rule for the turn over creatures you control, one
 *   arriving later included.
 *
 * Under banding the division is the other side's, so the choice is asked of
 * the attacker's controller alone first (`unblockedOnly`).
 */
import { describe, expect, it } from "vitest";

import { combatCreatures, damageThrough } from "../bot/combat-math.js";
import type { BlockerDeclaration, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { AutomaticController } from "../controller.js";
import type { ControllerView, DamageAssignmentAsk } from "../controller.js";
import { A, B, attack, cast, destroy, lands, life, ref, registryOf, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "assign-combat-damage" }>;

/** Bob blocks `attacker` with each of `blockers`. */
const blocks = (attacker: ObjectId, ...blockers: ObjectId[]): (() => BlockerDeclaration[]) => () =>
  blockers.map((blocker) => ({ blocker, attacker }));

describe("Thorn Elemental", () => {
  it("is asked with one blocker and no trample, and deals all 7 to the player", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, bears);
    const offers: Offer[] = [];
    a.assignCombatDamageFn = (view) => {
      offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return "unblocked";
    };
    attack(game, a, [thorn]);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ mayUnblocked: true, defender: B, blockers: [bears] });
    expect(life(game, B)).toBe(13);
    expect(zone(game, bears)).toBe("battlefield");
    // Still a blocked creature: Grizzly Bears dealt it damage.
    expect(game.state.objects[thorn].damageMarked).toBe(2);
  });

  it("declined, it assigns to its blocker as usual", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, bears);
    attack(game, a, [thorn]);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can still be chosen once its blocker has left combat", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, bears);
    a.declareAttackersFn = () => [{ attacker: thorn, defender: B }];
    toStep(game, "declare-blockers");
    destroy(game, bears);
    a.assignCombatDamageFn = () => "unblocked";
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(13);
  });

  it("with no blocker left and declined, deals nothing", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, bears);
    a.declareAttackersFn = () => [{ attacker: thorn, defender: B }];
    toStep(game, "declare-blockers");
    destroy(game, bears);
    a.assignCombatDamageFn = () => [];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
  });

  it("an unblocked one is never asked", () => {
    const { game, a } = table();
    const thorn = spawn(game, "Thorn Elemental");
    let asked = 0;
    a.assignCombatDamageFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [thorn]);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(13);
  });

  it("under banding, its controller chooses first; declined, the other side divides", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const hero = spawn(game, "Benalish Hero", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, hero, bears);
    const aOffers: Offer[] = [];
    a.assignCombatDamageFn = (view) => {
      aOffers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return [];
    };
    let bAsked: Offer | undefined;
    b.assignCombatDamageFn = (view) => {
      bAsked = view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage");
      return [7, 0];
    };
    attack(game, a, [thorn]);
    expect(aOffers).toHaveLength(1);
    expect(aOffers[0]).toMatchObject({ mayUnblocked: true, unblockedOnly: true });
    expect(bAsked).toMatchObject({ forOpponent: true });
    expect(bAsked?.mayUnblocked).toBeUndefined();
    expect(zone(game, hero)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("under banding, chosen, all of it goes to the player and the other side isn't asked", () => {
    const { game, a, b } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const hero = spawn(game, "Benalish Hero", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = blocks(thorn, hero, bears);
    a.assignCombatDamageFn = () => "unblocked";
    let bAsked = 0;
    b.assignCombatDamageFn = () => {
      bAsked += 1;
      return [7, 0];
    };
    attack(game, a, [thorn]);
    expect(bAsked).toBe(0);
    expect(life(game, B)).toBe(13);
  });

  it("the bots: a block doesn't stop its damage", () => {
    const { game } = table();
    spawn(game, "Thorn Elemental");
    spawn(game, "Grizzly Bears", B);
    const reg = registryOf(game);
    const through = damageThrough(combatCreatures(game.state, reg, A, false), combatCreatures(game.state, reg, B, true));
    expect(through.damage).toBe(7);
  });

  it("the automatic answer: past a blocker it can't kill, onto one it can", () => {
    const { game } = table();
    const thorn = spawn(game, "Thorn Elemental");
    const wall = spawn(game, "Wall of Denial", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const bot = new AutomaticController(A);
    const view = { state: game.state, player: A, legalActions: () => [] } as unknown as ControllerView;
    const ask = (blocker: ObjectId, lethal: number): DamageAssignmentAsk => ({
      attacker: thorn,
      blockers: [blocker],
      power: 7,
      lethal: [lethal],
      trample: false,
      indestructible: [false],
      mayUnblocked: true,
    });
    expect(bot.assignCombatDamage(view, ask(wall, 8))).toBe("unblocked");
    expect(bot.assignCombatDamage(view, ask(bears, 2))).toEqual([7]);
    // Lethal to the player it's attacking beats killing the blocker.
    game.state.objects[thorn].attacking = B;
    game.state.players[B].life = 7;
    expect(bot.assignCombatDamage(view, ask(bears, 2))).toBe("unblocked");
  });
});

describe("Indomitable Might", () => {
  it("lets the enchanted creature's controller assign as though unblocked", () => {
    const { game, a, b } = table({ deck: "Forest" });
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Denial", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Indomitable Might"), { targets: [ref(bears)] });
    b.declareBlockersFn = blocks(bears, wall);
    a.assignCombatDamageFn = () => "unblocked";
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Siege Behemoth", () => {
  it("gives each creature you control the choice while it's attacking", () => {
    const { game, a, b } = table();
    const behemoth = spawn(game, "Siege Behemoth");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Denial", B);
    b.declareBlockersFn = blocks(bears, wall);
    a.assignCombatDamageFn = () => "unblocked";
    attack(game, a, [behemoth, bears]);
    expect(life(game, B)).toBe(20 - 7 - 2);
  });

  it("not while it isn't attacking", () => {
    const { game, a, b } = table();
    spawn(game, "Siege Behemoth");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Denial", B);
    b.declareBlockersFn = blocks(bears, wall);
    let asked = 0;
    a.assignCombatDamageFn = () => {
      asked += 1;
      return "unblocked";
    };
    attack(game, a, [bears]);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Outmaneuver", () => {
  it("makes a blocked creature assign as though unblocked, with no question", () => {
    const { game, a, b } = table({ deck: "Mountain" });
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Denial", B);
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Outmaneuver");
    b.declareBlockersFn = blocks(bears, wall);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    let asked = 0;
    a.assignCombatDamageFn = () => {
      asked += 1;
      return [];
    };
    toStep(game, "declare-blockers");
    cast(game, spell, { x: 1, targets: [ref(bears)] });
    toStep(game, "postcombat-main");
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("an attacker isn't a blocked creature before blockers are declared", () => {
    const { game, a } = table({ deck: "Mountain" });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const spell = toHand(game, "Outmaneuver");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-attackers");
    expect(() => cast(game, spell, { x: 1, targets: [ref(bears)] })).toThrow();
  });
});

describe("Predatory Focus", () => {
  it("covers creatures you control this turn, one that arrives later too", () => {
    const { game, a, b } = table({ deck: "Forest" });
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Predatory Focus"));
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Denial", B);
    b.declareBlockersFn = blocks(bears, wall);
    a.assignCombatDamageFn = () => "unblocked";
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    settle(game);
    // Gone at end of turn.
    expect(game.state.turnUnblockedAssignments).toBeDefined();
    toStep(game, "precombat-main", B);
    expect(game.state.turnUnblockedAssignments).toBeUndefined();
  });
});
