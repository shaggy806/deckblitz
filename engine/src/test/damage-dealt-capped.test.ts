/**
 * The damage dealt this way, each event capped by what its recipient had
 * (`damageDealtThisWay`'s `capped` — Drain Life's "You gain life equal to the
 * damage dealt, but not more life than the player's life total before the
 * damage was dealt, the planeswalker's loyalty before the damage was dealt,
 * or the creature's toughness"), read off the `damage-dealt` event's
 * `before`.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, lands, life, ref, spawn, table, toHand } from "./harness.js";

describe("Drain Life", () => {
  it("gains no more than the player's life total before the damage", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 17 });
    expect(life(game, B)).toBe(3);
    const drain = toHand(game, "Drain Life");
    cast(game, drain, { x: 5, targets: [ref(B)] });
    expect(life(game, B)).toBe(-2);
    expect(life(game, A)).toBe(23);
  });

  it("gains all of it from a player with more life", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const drain = toHand(game, "Drain Life");
    cast(game, drain, { x: 4, targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("gains no more than the creature's toughness, however damaged it was", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 2 }, [ref(giant)]);
    const drain = toHand(game, "Drain Life");
    cast(game, drain, { x: 5, targets: [ref(giant)] });
    expect(game.state.objects[giant].zone).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("gains no more than the planeswalker's loyalty before the damage", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const walker = spawn(game, "Liliana of the Veil", B);
    const loyalty = game.state.objects[walker].counters.loyalty ?? 0;
    expect(loyalty).toBe(3);
    const drain = toHand(game, "Drain Life");
    cast(game, drain, { x: 5, targets: [ref(walker)] });
    expect(life(game, A)).toBe(20 + loyalty);
  });

  it("spends only black mana on X", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 3);
    const drain = toHand(game, "Drain Life");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: drain, targets: [ref(B)], xValue: 3 })).toMatch(/mana|pay/i);
    cast(game, drain, { x: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
