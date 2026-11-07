/**
 * "All damage is dealt as though its source had wither" — the
 * `damageAsThoughSourceHad` static (rules 120.3d, 702.80a): every source's
 * damage to a creature becomes -1/-1 counters, though no source gains
 * wither. Everlasting Torment, beside its "players can't gain life" and
 * "damage can't be prevented".
 */

import { describe, expect, it } from "vitest";

import {
  A,
  attack,
  B,
  cast,
  counters,
  keywords,
  lands,
  life,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Everlasting Torment", () => {
  it("turns a spell's damage to a creature into -1/-1 counters", () => {
    const { game } = table();
    spawn(game, "Everlasting Torment");
    lands(game, "Mountain", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(bear)] });
    // Three -1/-1 counters on a 2/2: dead by toughness, no damage marked.
    expect(zone(game, bear)).toBe("graveyard");
    const death = game.events.find((e) => e.type === "counter-added" && e.object === bear);
    expect(death).toMatchObject({ counter: "-1/-1", amount: 3 });
  });

  it("marks no damage, and the counters stay past the turn", () => {
    const { game } = table();
    spawn(game, "Everlasting Torment");
    const wall = spawn(game, "Wall of Stone", B);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 2 }, [ref(wall)]);
    expect(game.state.objects[wall].damageMarked).toBe(0);
    expect(counters(game, wall, "-1/-1")).toBe(2);
    // The source didn't gain wither: nothing reads it as having it.
    expect(keywords(game, wall).has("wither")).toBe(false);
  });

  it("is marked damage as usual without it", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 2 }, [ref(wall)]);
    expect(game.state.objects[wall].damageMarked).toBe(2);
    expect(counters(game, wall, "-1/-1")).toBe(0);
  });

  it("leaves damage to a player as life loss", () => {
    const { game } = table();
    spawn(game, "Everlasting Torment");
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 3 }, [ref(B)]);
    expect(life(game, B)).toBe(17);
  });

  it("stops life gain", () => {
    const { game } = table();
    spawn(game, "Everlasting Torment");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    expect(life(game, A)).toBe(20);
  });

  it("lets no damage be prevented: a Fog's shield prevents nothing, and the counters go on", () => {
    const { game, a, b } = table();
    spawn(game, "Everlasting Torment");
    const bear = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Stone", B);
    lands(game, "Forest", 1);
    const fog = toHand(game, "Fog");
    cast(game, fog);
    expect(zone(game, fog)).toBe("graveyard");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bear }];
    attack(game, a, [bear]);
    expect(counters(game, wall, "-1/-1")).toBe(2);
    // The wall's 0 power deals nothing back.
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[wall].damageMarked).toBe(0);
  });
});
