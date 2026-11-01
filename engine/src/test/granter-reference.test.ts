/**
 * An ability a permanent's static grants another, naming the granting
 * permanent (rule 201.5a — "the name refers only to the specific object which
 * is that first ability's source"): the `"granter"` reference, fixed as the
 * ability is activated or triggered (`LastKnownRefs.granter`). A `"granter"`
 * sacrifice cost (Ninja's Kunai), damage dealt by the granter as it last
 * existed (`from: "granter"`, 608.2h), an effect on it (Trusty Boomerang's
 * return, only while it's the same permanent — 400.7), a read of its counters
 * (Archery Training), and a granted trigger that may sacrifice it (Spare
 * Dagger).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, counters, hand, lands, life, pickModes, pickTargets, ref, spawn, table, zone } from "./harness.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const equipTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.state.objects[equipment].attachedTo = creature;
};
/** Bob's next turn, `giant` attacking alice, alice with priority in the
 * declare-blockers step. */
const bobAttacksWith = (game: Game, b: ScriptedController, giant: ObjectId): void => {
  b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
  game.advanceUntil(
    (s) => s.turn.number === 2 && s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null,
  );
};
const canActivate = (game: Game, source: ObjectId, index = 0): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

describe("Ninja's Kunai — sacrifice the granter, and it deals the damage", () => {
  it("sacrifices the Equipment as the cost and deals 3 from it", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const kunai = spawn(game, "Ninja's Kunai");
    equipTo(game, kunai, bears);
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(zone(game, kunai)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
    // The damage's source was the Kunai, not the creature.
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt");
    expect(dealt.at(-1)).toMatchObject({ source: kunai });
  });

  it("can't be activated while someone else controls the Kunai", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const kunai = spawn(game, "Ninja's Kunai", B);
    equipTo(game, kunai, bears);
    expect(canActivate(game, bears)).toBe(false);
  });

  it("is gone with the Equipment unattached", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Ninja's Kunai");
    expect(canActivate(game, bears)).toBe(false);
  });
});

describe("Trusty Boomerang — return the granter", () => {
  it("taps the target and returns the Equipment to its owner's hand", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const boomerang = spawn(game, "Trusty Boomerang");
    const victim = spawn(game, "Hill Giant", B);
    equipTo(game, boomerang, bears);
    activate(game, bears, 0, { targets: [ref(victim)] });
    expect(game.state.objects[victim].tapped).toBe(true);
    expect(zone(game, boomerang)).toBe("hand");
    expect(hand(game)).toContain(boomerang);
  });

  it("returns nothing once the Equipment is a new object (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const boomerang = spawn(game, "Trusty Boomerang");
    const victim = spawn(game, "Hill Giant", B);
    equipTo(game, boomerang, bears);
    activate(game, bears, 0, { targets: [ref(victim)], settle: false });
    // In response, the Boomerang leaves and comes back.
    game.debugMove(boomerang, "graveyard");
    game.debugMove(boomerang, "battlefield");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.objects[victim].tapped).toBe(true);
    expect(zone(game, boomerang)).toBe("battlefield");
  });
});

describe("Archery Training — the granter's counters", () => {
  it("deals X, the arrow counters on the Aura, to an attacking creature", () => {
    const { game, b } = table();
    const archer = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Archery Training");
    game.state.objects[aura].attachedTo = archer;
    game.state.objects[aura].counters = { arrow: 2 };
    const giant = spawn(game, "Hill Giant", B);
    // Bob attacks with the giant; alice shoots it in the declare-blockers step.
    bobAttacksWith(game, b, giant);
    game.dispatch({ type: "activate-ability", player: A, source: archer, abilityIndex: 0, targets: [ref(giant)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("reads the counters as the Aura last existed once it's gone (608.2h)", () => {
    const { game, b } = table();
    const archer = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Archery Training");
    game.state.objects[aura].attachedTo = archer;
    game.state.objects[aura].counters = { arrow: 3 };
    const giant = spawn(game, "Hill Giant", B);
    bobAttacksWith(game, b, giant);
    game.dispatch({ type: "activate-ability", player: A, source: archer, abilityIndex: 0, targets: [ref(giant)] });
    game.debugMove(aura, "graveyard");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Spare Dagger — a granted trigger that may sacrifice its granter", () => {
  it("sacrificed, the creature deals 1 damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const dagger = spawn(game, "Spare Dagger");
    equipTo(game, dagger, bears);
    pickModes(a, 0);
    pickTargets(a, B);
    attack(game, a, [bears]);
    expect(zone(game, dagger)).toBe("graveyard");
    // 1 from the reflexive trigger, then 2 combat damage from the unequipped bears.
    expect(life(game, B)).toBe(17);
    expect(counters(game, bears)).toBe(0);
  });

  it("declined, nothing happens and the Dagger stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const dagger = spawn(game, "Spare Dagger");
    equipTo(game, dagger, bears);
    pickModes(a);
    attack(game, a, [bears]);
    expect(zone(game, dagger)).toBe("battlefield");
    // 3 combat damage with the +1/+0.
    expect(life(game, B)).toBe(17);
  });
});
