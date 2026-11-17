/**
 * `deals-combat-damage-to-player`'s `toOwner` — "whenever a creature deals
 * combat damage to its owner" (rules 108.3, 111.2): the player dealt the
 * damage owns the creature that dealt it. The Beast, Deathless Prince, whose
 * cast trigger steals the creature that does it, and whose six stun counters
 * (rule 122.1d) each such hit wears down by one.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, cast, controller, counters, grant, hand, keywords, lands, pickTargets, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Alice takes `id` (for good), and it can attack this turn. */
const steal = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(id)]);
  grant(game, id, "haste");
};

describe("The Beast, Deathless Prince", () => {
  it("cast: steals target creature until end of turn, untapped, with menace and haste; enters tapped with six stun counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    pickTargets(a, bears);
    const beast = toHand(game, "The Beast, Deathless Prince");
    cast(game, beast);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(zone(game, beast)).toBe("battlefield");
    expect(game.state.objects[beast].tapped).toBe(true);
    expect(counters(game, beast, "stun")).toBe(6);
  });

  it("a creature dealing combat damage to its owner: untap The Beast (a stun counter comes off instead) and draw a card", () => {
    const { game, a } = table();
    // On the battlefield as it enters: tapped, with six stun counters.
    const beast = spawn(game, "The Beast, Deathless Prince", A);
    expect(counters(game, beast, "stun")).toBe(6);
    // Bob's creature, under alice's control.
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, bears);
    const before = hand(game, A).length;
    attack(game, a, [bears]);
    expect(game.state.players[B].life).toBe(18);
    expect(counters(game, beast, "stun")).toBe(5);
    expect(game.state.objects[beast].tapped).toBe(true);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("with no stun counters left, it untaps", () => {
    const { game, a } = table();
    const beast = spawn(game, "The Beast, Deathless Prince", A);
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "stun", amount: "all" }, [ref(beast)]);
    expect(game.state.objects[beast].tapped).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    steal(game, bears);
    attack(game, a, [bears]);
    expect(game.state.objects[beast].tapped).toBe(false);
  });

  it("not for a creature hitting a player who doesn't own it", () => {
    const { game, a } = table({ players: 3 });
    const beast = spawn(game, "The Beast, Deathless Prince", A, { tapped: true });
    const own = spawn(game, "Grizzly Bears", A);
    // Bob's creature, under alice's control, attacking carol.
    const bobs = spawn(game, "Grizzly Bears", B);
    steal(game, bobs);
    const before = hand(game, A).length;
    a.declareAttackersFn = () => [
      { attacker: own, defender: B },
      { attacker: bobs, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(18);
    expect(game.state.players[C].life).toBe(18);
    expect(game.state.objects[beast].tapped).toBe(true);
    expect(hand(game, A).length).toBe(before);
  });
});
