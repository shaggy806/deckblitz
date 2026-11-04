/**
 * A static prevention's follow-up naming the creature the damage was prevented
 * to (rule 615): `then`'s `"trigger-recipient"`, with one follow-up per
 * recipient over a simultaneous event.
 *
 * Proving card: Vigor.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, cast, counters, lands, life, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Vigor", () => {
  it("prevents damage to another creature you control and counters that creature for each 1 prevented", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vigor");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bear)] });
    settle(game);
    expect(game.state.objects[bear].damageMarked).toBe(0);
    expect(counters(game, bear)).toBe(3);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
    expect(counters(game, other)).toBe(0);
  });

  it("a sweep counters each creature for its own damage", () => {
    const t = table();
    const { game } = t;
    const vigor = spawn(game, "Vigor");
    const a = spawn(game, "Grizzly Bears");
    const b = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Pyroclasm"));
    settle(game);
    expect(counters(game, a)).toBe(2);
    expect(counters(game, b)).toBe(2);
    expect(counters(game, vigor)).toBe(0);
    expect(game.state.objects[vigor].damageMarked).toBe(2);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("doesn't cover you", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vigor");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    settle(game);
    expect(life(game, A)).toBe(17);
  });

  it("in combat each creature gets its own total, and the damage it deals is untouched", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vigor");
    const a = spawn(game, "Grizzly Bears");
    const b = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const bear = spawn(game, "Grizzly Bears", B);
    t.b.declareBlockersFn = () => [
      { blocker: giant, attacker: a },
      { blocker: bear, attacker: b },
    ];
    attack(game, t.a, [a, b]);
    settle(game);
    expect(counters(game, a)).toBe(3);
    expect(counters(game, b)).toBe(2);
    expect(zone(game, a)).toBe("battlefield");
    expect(zone(game, b)).toBe("battlefield");
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("two blockers on one attacker: one follow-up with the total (rule 614.5)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vigor");
    const a = spawn(game, "Hill Giant");
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    t.b.declareBlockersFn = () => [
      { blocker: x, attacker: a },
      { blocker: y, attacker: a },
    ];
    attack(game, t.a, [a]);
    settle(game);
    expect(counters(game, a)).toBe(5);
    expect(game.state.eventLog.filter((e) => e.type === "counter-added" && e.object === a)).toHaveLength(1);
  });

  it("damage that can't be prevented is dealt, and adds nothing (rule 615.12)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Vigor");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0, cantBePrevented: true }, [ref(giant)]);
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(counters(game, giant)).toBe(0);
  });

  it("shuffles into its owner's library from the graveyard", () => {
    const t = table();
    const { game } = t;
    const vigor = spawn(game, "Vigor");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(vigor)] });
    settle(game);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(vigor)] });
    settle(game);
    expect(game.state.zones.perPlayer[A].graveyard.some((id) => game.state.objects[id].cardName === "Vigor")).toBe(false);
    expect(game.state.zones.perPlayer[A].library.some((id) => game.state.objects[id].cardName === "Vigor")).toBe(true);
  });
});
