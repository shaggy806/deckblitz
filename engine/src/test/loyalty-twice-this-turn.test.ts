/**
 * "You may activate loyalty abilities of Kaito twice this turn rather than
 * only once" (Kaito, Dancing Shadow) — the `loyalty-activations` effect, a
 * resolved exception to rule 606.3 ("only if no player has previously
 * activated a loyalty ability of that permanent that turn") for one permanent
 * and one turn. The card's rulings: it isn't additive, and the two may be the
 * same ability or different ones.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, destroy, hand, life, loyalty, named, pickPermanents, ref, spawn, table, toStep, zone } from "./harness.js";

function board() {
  const t = table();
  const kaito = spawn(t.game, "Kaito, Dancing Shadow");
  const bears = spawn(t.game, "Grizzly Bears");
  const giant = spawn(t.game, "Hill Giant");
  return { ...t, kaito, bears, giant };
}

const loyaltyOf = (game: ReturnType<typeof board>["game"], id: ReturnType<typeof spawn>): number =>
  game.state.objects[id].counters.loyalty ?? 0;

describe("Kaito, Dancing Shadow", () => {
  it("returning one of the creatures that dealt the damage allows two activations, not three", () => {
    const { game, a, kaito, bears, giant } = board();
    const offer = pickPermanents(a, bears);
    // Only the Bears deal damage: the Giant isn't one of them.
    attack(game, a, [bears]);
    expect(offer.offered).toEqual([bears]);
    expect(hand(game)).toContain(bears);
    expect(zone(game, giant)).toBe("battlefield");
    const before = loyaltyOf(game, kaito);
    const cards = hand(game).length;
    loyalty(game, kaito, 0);
    loyalty(game, kaito, 1, { targets: [null] });
    expect(hand(game).length).toBe(cards + 1);
    expect(loyaltyOf(game, kaito)).toBe(before + 1);
    expect(() => loyalty(game, kaito, 0)).toThrow();
  });

  it("the same ability twice", () => {
    const { game, a, kaito, bears } = board();
    pickPermanents(a, bears);
    attack(game, a, [bears]);
    const cards = hand(game).length;
    loyalty(game, kaito, 0);
    loyalty(game, kaito, 0);
    expect(hand(game).length).toBe(cards + 2);
  });

  it("declining leaves the one activation rule 606.3 gives", () => {
    const { game, a, kaito, bears } = board();
    pickPermanents(a);
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    loyalty(game, kaito, 0);
    expect(() => loyalty(game, kaito, 0)).toThrow();
  });

  it("is over with the turn, and an activation before combat counts", () => {
    const { game, a, kaito, bears } = board();
    loyalty(game, kaito, 0);
    pickPermanents(a, bears);
    attack(game, a, [bears]);
    // One before combat, so one more this turn.
    loyalty(game, kaito, 0);
    expect(() => loyalty(game, kaito, 0)).toThrow();
    a.declareAttackersFn = () => [];
    toStep(game, "precombat-main");
    loyalty(game, kaito, 0);
    expect(() => loyalty(game, kaito, 0)).toThrow();
  });

  it("−2 makes a 2/2 deathtouch Drone that drains as it leaves", () => {
    const { game, kaito } = board();
    loyalty(game, kaito, -2);
    const [drone] = named(game, "Drone Token (Kaito, Dancing Shadow)");
    expect(drone).toBeDefined();
    destroy(game, drone);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("+1 holds a creature back until your next turn", () => {
    const { game, b, kaito } = board();
    const ogre = spawn(game, "Grizzly Bears", B);
    loyalty(game, kaito, 1, { targets: [ref(ogre)] });
    // It can't attack, so bob is never asked: nothing reaches alice or Kaito.
    let asked = false;
    b.declareAttackersFn = () => {
      asked = true;
      return [{ attacker: ogre, defender: A }];
    };
    toStep(game, "postcombat-main", B);
    expect(asked).toBe(false);
    expect(life(game, A)).toBe(20);
  });
});
