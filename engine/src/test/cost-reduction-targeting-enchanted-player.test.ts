/**
 * A cost reduction for spells that target the player an Aura enchants
 * (`costModification.targetingEnchantedPlayer`, rule 601.2f after 601.2c):
 * Infectious Curse's "spells you cast that target enchanted player cost {1}
 * less to cast". Accursed Witch, whose back face it is — its front's "spells
 * your opponents cast that target this creature cost {1} less" is
 * `targetingSource`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, cast, destroy, lands, life, nextTurn, pickTargets, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castOffer = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer | undefined =>
  game.legalActions(player).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
/** Every target the offer has for its one slot, as ids. */
const offered = (game: Game, card: ObjectId, player: PlayerId = A): string[] =>
  (castOffer(game, card, player)?.targetOptions[0] ?? []).map((t) => (t.kind === "object" ? t.object : t.player));

/** Infectious Curse on bob: Accursed Witch dies, back as the Curse on him. */
const cursed = (game: Game, a: Parameters<typeof pickTargets>[0], on: PlayerId = B): ObjectId => {
  const witch = spawn(game, "Accursed Witch");
  pickTargets(a, on);
  destroy(game, witch);
  settle(game);
  return witch;
};

describe("Accursed Witch", () => {
  it("an opponent's spell targeting it costs {1} less; at it alone, a Mountain casts Searing Spear", () => {
    const { game } = table();
    const witch = spawn(game, "Accursed Witch");
    lands(game, "Mountain", 1, B);
    const spear = toHand(game, "Searing Spear", B);
    // Bob passes priority to himself through Alice: his own turn instead.
    nextTurn(game);
    expect(offered(game, spear, B)).toEqual([witch]);
    cast(game, spear, { player: B, targets: [ref(witch)] });
    // Dead, and back as the Curse (on bob, the only opponent).
    expect(game.state.objects[witch].face).toBe(1);
    expect(game.state.objects[witch].attachedToPlayer).toBe(B);
  });

  it("isn't cheaper for its controller's own spells", () => {
    const { game } = table();
    spawn(game, "Accursed Witch");
    lands(game, "Mountain", 1);
    const spear = toHand(game, "Searing Spear");
    expect(castOffer(game, spear)).toBeUndefined();
  });

  it("dies and comes back as Infectious Curse on the target opponent", () => {
    const { game, a } = table({ players: 3 });
    const witch = cursed(game, a, C);
    expect(zone(game, witch)).toBe("battlefield");
    expect(game.state.objects[witch].face).toBe(1);
    expect(game.state.objects[witch].attachedToPlayer).toBe(C);
    expect(game.state.objects[witch].controller).toBe(A);
  });
});

describe("Infectious Curse", () => {
  it("your spells that target enchanted player cost {1} less: a Mountain casts Searing Spear at bob and nothing else", () => {
    const { game, a } = table();
    cursed(game, a);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    const spear = toHand(game, "Searing Spear");
    expect(offered(game, spear)).toEqual([B]);
    expect(offered(game, spear)).not.toContain(bears);
    cast(game, spear, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Mountain")!].tapped).toBe(true);
  });

  it("with enough mana every target is offered, and only one at bob is reduced", () => {
    const { game, a } = table();
    cursed(game, a);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    const spear = toHand(game, "Searing Spear");
    expect(offered(game, spear)).toEqual(expect.arrayContaining([A, B, bears]));
    cast(game, spear, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain" && !game.state.objects[id].tapped)).toHaveLength(0);
  });

  it("not another player's: bob's own spell at himself costs full", () => {
    const { game, a } = table();
    cursed(game, a);
    lands(game, "Mountain", 1, B);
    const spear = toHand(game, "Searing Spear", B);
    nextTurn(game);
    expect(castOffer(game, spear, B)).toBeUndefined();
  });

  it("at the beginning of enchanted player's upkeep, they lose 1 life and you gain 1", () => {
    const { game, a } = table();
    cursed(game, a);
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});
