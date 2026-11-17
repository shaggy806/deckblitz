/**
 * "Only [a player] may activate this ability" (rule 602.1b; 602.2's "unless
 * the object specifically says otherwise" — `ActivatedAbility.onlyBy`):
 * Personal Incarnation's owner, whoever controls it; and Martyrdom's
 * granted ability, whose "only you" is Martyrdom's controller, bound as it
 * resolves — they keep it through a change of control of the creature, and
 * its new controller can't activate it.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Whether `player` is offered an activation of `source`'s ability. */
const offered = (game: Game, player: PlayerId, source: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

/** `to` gains control of `id` for good, the effect settled. */
const takeControl = (game: Game, to: PlayerId, id: ObjectId): void => {
  game.debugApplyEffect(to, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(id)]);
  settle(game);
};

/** Bob gets priority, a spell of Alice's on the stack. */
const bobsPriority = (game: Game): void => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Shock"), { targets: [ref(B)], settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  expect(game.state.priority.holder).toBe(B);
};

describe("Martyrdom — the granted ability is its caster's alone", () => {
  it("redirects the next 1 damage to a target player to the creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Martyrdom"), { targets: [ref(bears)] });
    expect(offered(game, A, bears)).toBe(true);
    activate(game, bears, 0, { targets: [ref(A)] });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });

  it("stays its caster's through a change of control, and its new controller can't activate it", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Martyrdom"), { targets: [ref(bears)] });
    takeControl(game, B, bears);
    expect(game.state.objects[bears].controller).toBe(B);
    // Alice may, though she no longer controls it (602.1b).
    expect(offered(game, A, bears)).toBe(true);
    bobsPriority(game);
    expect(offered(game, B, bears)).toBe(false);
    expect(game.canDispatch({ type: "activate-ability", player: B, source: bears, abilityIndex: 0, targets: [ref(B)] })).toMatch(
      /only one player may activate/,
    );
  });

  it("is lost at end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Martyrdom"), { targets: [ref(bears)] });
    expect(offered(game, A, bears)).toBe(true);
    game.advanceUntil((s) => s.turn.number > 1 && s.priority.holder === A);
    expect(offered(game, A, bears)).toBe(false);
  });
});

describe("Personal Incarnation — only its owner may activate it", () => {
  it("its owner redirects its damage to themselves, even while another player controls it", () => {
    const { game } = table();
    const incarnation = spawn(game, "Personal Incarnation");
    expect(offered(game, A, incarnation)).toBe(true);
    takeControl(game, B, incarnation);
    // Still Alice's to activate, its owner; the damage goes to her.
    expect(offered(game, A, incarnation)).toBe(true);
    activate(game, incarnation);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(incarnation)] });
    expect(life(game, A)).toBe(19);
    expect(game.state.objects[incarnation].damageMarked).toBe(1);
  });

  it("its controller who isn't its owner can't activate it", () => {
    const { game } = table();
    const incarnation = spawn(game, "Personal Incarnation");
    takeControl(game, B, incarnation);
    bobsPriority(game);
    expect(offered(game, B, incarnation)).toBe(false);
  });

  it("as it dies, its owner — not its controller — loses half their life, rounded up", () => {
    const { game } = table({ life: 15 });
    const incarnation = spawn(game, "Personal Incarnation");
    takeControl(game, B, incarnation);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(incarnation)]);
    settle(game);
    expect(zone(game, incarnation)).toBe("graveyard");
    expect(life(game, A)).toBe(7);
    expect(life(game, B)).toBe(15);
  });
});
