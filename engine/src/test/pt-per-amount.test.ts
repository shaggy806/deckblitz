/**
 * A creature's P/T, or a bonus, read from a player's own state (the
 * `static:pt-per-amount` family's hand-size and life-total unit): a layer-7c
 * bonus scaled by the cards in its controller's hand, its opponents' hands
 * or the affected creature's controller's hand (`grantPtPerCount.cardsInHand`),
 * or by a life total (`grantPtPerCount.lifeTotal`), and a characteristic-
 * defining P/T equal to a life total (`CountSpec` `"your-life-total"`, rule
 * 604.3).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, lands, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("P/T scaled by a hand size", () => {
  it("Grim Strider: -1/-1 for each card in your hand, read live", () => {
    const { game } = table();
    const strider = spawn(game, "Grim Strider");
    const size = (): number => 6 - hand(game).length;
    expect(hand(game).length).toBeGreaterThan(0);
    expect(pt(game, strider)).toEqual({ power: size(), toughness: size() });
    const before = pt(game, strider).power;
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    expect(pt(game, strider)).toEqual({ power: before - 2, toughness: before - 2 });
    // An opponent's hand doesn't count.
    toHand(game, "Wastes", B);
    expect(pt(game, strider)).toEqual({ power: before - 2, toughness: before - 2 });
  });

  it("Enemy of Enlightenment: every opponent's hand together, not its controller's", () => {
    const { game } = table({ players: 3 });
    const enemy = spawn(game, "Enemy of Enlightenment");
    const opponents = (): number => hand(game, B).length + hand(game, C).length;
    expect(pt(game, enemy)).toEqual({ power: 5 - opponents(), toughness: 5 - opponents() });
    const before = pt(game, enemy).power;
    toHand(game, "Wastes");
    expect(pt(game, enemy).power).toBe(before);
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", C);
    expect(pt(game, enemy).power).toBe(before - 2);
    // A player who has left the game has no hand to count (rule 800.4a).
    const carols = hand(game, C).length;
    game.state.players[C].hasLost = true;
    expect(pt(game, enemy).power).toBe(before - 2 + carols);
  });

  it("Righteous Authority: the enchanted creature's controller's hand, not the Aura's controller's", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    lands(game, "Island", 2);
    const aura = toHand(game, "Righteous Authority");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    const bobs = hand(game, B).length;
    expect(bobs).not.toBe(hand(game, A).length);
    expect(pt(game, bears)).toEqual({ power: 2 + bobs, toughness: 2 + bobs });
    // Alice's hand doesn't move it; bob's does.
    toHand(game, "Wastes");
    expect(pt(game, bears).power).toBe(2 + bobs);
    toHand(game, "Wastes", B);
    expect(pt(game, bears).power).toBe(3 + bobs);
    // On alice's own creature it reads alice's hand.
    const elves = spawn(game, "Llanowar Elves");
    game.state.objects[aura].attachedTo = elves;
    expect(pt(game, elves).power).toBe(1 + hand(game, A).length);
  });
});

describe("P/T scaled by a life total", () => {
  it("Death's Shadow: -X/-X where X is your life total, a negative life used as it is (rule 107.1b)", () => {
    const { game } = table();
    const shadow = spawn(game, "Death's Shadow");
    expect(pt(game, shadow)).toEqual({ power: -7, toughness: -7 });
    game.state.players[A].life = 5;
    expect(pt(game, shadow)).toEqual({ power: 8, toughness: 8 });
    // The opponent's life total is no part of it.
    game.state.players[B].life = 1;
    expect(pt(game, shadow)).toEqual({ power: 8, toughness: 8 });
    game.state.players[A].life = -2;
    expect(pt(game, shadow)).toEqual({ power: 15, toughness: 15 });
  });

  it("Death's Shadow at 20 life dies to state-based actions", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const shadow = toHand(game, "Death's Shadow");
    cast(game, shadow);
    expect(zone(game, shadow)).toBe("graveyard");
  });

  it("Serra Avatar: power and toughness equal to your life total, in every zone (rule 604.3)", () => {
    const { game } = table();
    const avatar = spawn(game, "Serra Avatar");
    expect(pt(game, avatar)).toEqual({ power: 20, toughness: 20 });
    game.state.players[A].life = 7;
    expect(pt(game, avatar)).toEqual({ power: 7, toughness: 7 });
    // In a graveyard, its owner's life total.
    const other = toGraveyard(game, "Serra Avatar", B);
    expect(pt(game, other)).toEqual({ power: 20, toughness: 20 });
  });
});
