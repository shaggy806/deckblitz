/**
 * "Damage that would reduce your life total to less than N reduces it to N
 * instead" as a static (`damageLifeFloor` — Ali from Cairo, Worship, Elderscale
 * Wurm), beside `player-effect`'s Angel's Grace form. The damage is still dealt
 * in full, a total below N drops as normal, and a loss of life goes past it.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, destroy, enter, lands, life, ref, spawn, table, toHand } from "./harness.js";

const bolt = (t: ReturnType<typeof table>, player = A): void => {
  lands(t.game, "Mountain", 1);
  cast(t.game, toHand(t.game, "Lightning Bolt"), { targets: [ref(player)] });
};

describe("Ali from Cairo", () => {
  it("holds its controller at 1, the damage still dealt in full", () => {
    const t = table({ life: 2 });
    spawn(t.game, "Ali from Cairo");
    bolt(t);
    expect(life(t.game)).toBe(1);
    expect(t.game.eventsOfType("damage-dealt").some((e) => e.amount === 3)).toBe(true);
    expect(t.game.state.result.over).toBe(false);
  });

  it("takes damage that leaves them above it as normal", () => {
    const t = table({ life: 10 });
    spawn(t.game, "Ali from Cairo");
    bolt(t);
    expect(life(t.game)).toBe(7);
  });

  it("does nothing for another player", () => {
    const t = table({ life: 2 });
    spawn(t.game, "Ali from Cairo", B);
    bolt(t);
    expect(life(t.game)).toBe(-1);
  });

  it("stops being a floor when it's gone", () => {
    const t = table({ life: 2 });
    const ali = spawn(t.game, "Ali from Cairo");
    destroy(t.game, ali);
    bolt(t);
    expect(life(t.game)).toBe(-1);
  });

  it("lets a loss of life past (it's only damage)", () => {
    const t = table({ life: 1 });
    spawn(t.game, "Ali from Cairo");
    lands(t.game, "Swamp", 2);
    cast(t.game, toHand(t.game, "Sign in Blood"), { targets: [ref(A)] });
    expect(life(t.game)).toBe(-1);
  });

  it("gives combat damage from several attackers the same floor, each counted", () => {
    const t = table({ life: 3 });
    spawn(t.game, "Ali from Cairo", B);
    const first = spawn(t.game, "Grizzly Bears", A, { sick: false });
    const second = spawn(t.game, "Grizzly Bears", A, { sick: false });
    attack(t.game, t.a, [first, second]);
    expect(life(t.game, B)).toBe(1);
  });
});

describe("Worship", () => {
  it("is a floor while you control a creature, and only then", () => {
    const t = table({ life: 2 });
    spawn(t.game, "Worship");
    bolt(t);
    expect(life(t.game)).toBe(-1);
    const u = table({ life: 2 });
    spawn(u.game, "Worship");
    const bears = spawn(u.game, "Grizzly Bears");
    bolt(u);
    expect(life(u.game)).toBe(1);
    destroy(u.game, bears);
    bolt(u);
    expect(life(u.game)).toBe(-2);
  });
});

describe("Elderscale Wurm", () => {
  it("raises a life total below 7 to 7 as it enters", () => {
    const t = table({ life: 3 });
    enter(t.game, "Elderscale Wurm");
    expect(life(t.game)).toBe(7);
  });

  it("leaves a life total of 7 or more alone as it enters", () => {
    const t = table({ life: 9 });
    enter(t.game, "Elderscale Wurm");
    expect(life(t.game)).toBe(9);
  });

  it("at 7 or more, damage takes you no lower than 7", () => {
    const t = table({ life: 8 });
    spawn(t.game, "Elderscale Wurm");
    bolt(t);
    expect(life(t.game)).toBe(7);
    bolt(t);
    expect(life(t.game)).toBe(7);
  });

  it("below 7, damage drops as normal (the ruling)", () => {
    const t = table({ life: 6 });
    spawn(t.game, "Elderscale Wurm");
    bolt(t);
    expect(life(t.game)).toBe(3);
  });

  it("the highest floor applies", () => {
    const t = table({ life: 8 });
    spawn(t.game, "Elderscale Wurm");
    spawn(t.game, "Ali from Cairo");
    bolt(t);
    expect(life(t.game)).toBe(7);
  });
});
