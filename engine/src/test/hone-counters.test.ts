/**
 * Hone counters (rule 122.1j): a hone counter on an Equipment gives +1/+0 to
 * any creature that Equipment is attached to — the counter's own effect, not
 * an ability. Dwalin, Weaponmaster and Sting, Bilbo's Sword. Written from the
 * Oracle text and the rulings.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, counters, enter, lands, pickTargets, pt, ref, spawn, table } from "./harness.js";

describe("hone counters", () => {
  it("each one on an Equipment gives the equipped creature +1/+0, and nothing once unattached", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Short Sword");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "hone", amount: 2 }, [ref(sword)]);
    lands(game, "Wastes", 1);
    activate(game, sword, 0, { targets: [ref(bears)] });
    // Short Sword's own +1/+1, and +2/+0 from the counters.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    game.debugApplyEffect(A, { kind: "unattach", target: 0 }, [ref(sword)]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("still works from an Equipment that has lost its abilities (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Short Sword");
    lands(game, "Wastes", 1);
    activate(game, sword, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "hone", amount: 1 }, [ref(sword)]);
    game.debugApplyEffect(A, { kind: "become", loseAbilities: true, filter: { subtype: "Equipment" }, duration: "end-of-turn" });
    // Short Sword's +1/+1 is gone with its abilities; the counter's +1/+0 isn't.
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Dwalin, Weaponmaster", () => {
  it("puts a hone counter on each Equipment you control as it enters and as it attacks", () => {
    const { game, a } = table();
    const mine = spawn(game, "Short Sword");
    const theirs = spawn(game, "Short Sword", B);
    const dwalin = enter(game, "Dwalin, Weaponmaster");
    expect(counters(game, mine, "hone")).toBe(1);
    expect(counters(game, theirs, "hone")).toBe(0);
    attack(game, a, [dwalin]);
    expect(counters(game, mine, "hone")).toBe(2);
  });
});

describe("Sting, Bilbo's Sword", () => {
  it("gets a hone counter for each creature target opponent controls, and attaches to your creature", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B, bears);
    const sting = enter(game, "Sting, Bilbo's Sword");
    expect(counters(game, sting, "hone")).toBe(3);
    expect(game.state.objects[sting].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });
});
