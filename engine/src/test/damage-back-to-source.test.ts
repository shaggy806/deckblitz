/**
 * Tephraderm: `deals-damage` aimed at this creature (`to: "self"`), split by
 * the source — a creature (the damage goes back to it, the trigger object) or
 * a spell (`isSpell` as it deals it; the damage goes to its controller,
 * `"trigger-controller"`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, attack, B, cast, lands, life, nextTurn, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked ?? 0;

describe("Tephraderm", () => {
  it("deals the damage a creature dealt it back to that creature", () => {
    const { game } = table();
    const derm = spawn(game, "Tephraderm");
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 2 }, [ref(derm)], { source: giant });
    settle(game);
    expect(damage(game, derm)).toBe(2);
    expect(damage(game, giant)).toBe(2);
    expect(life(game, B)).toBe(20);
  });

  it("answers a blocker's combat damage, and a creature's ability is that creature's damage", () => {
    const { game, a, b } = table();
    const derm = spawn(game, "Tephraderm");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: derm }];
    attack(game, a, [derm]);
    // The Giant died to combat damage; the trigger's damage finds nothing.
    expect(zone(game, giant)).toBe("graveyard");
    expect(damage(game, derm)).toBe(3);
    expect(life(game, B)).toBe(20);

    const { game: g2 } = table();
    const derm2 = spawn(g2, "Tephraderm");
    // Its own Pyromancer, so it's Alice's priority to use.
    const pyromancer = spawn(g2, "Prodigal Pyromancer");
    activate(g2, pyromancer, 0, { targets: [ref(derm2)] });
    expect(damage(g2, derm2)).toBe(1);
    expect(zone(g2, pyromancer)).toBe("graveyard");
    expect(life(g2, A)).toBe(20);
  });

  it("deals a spell's damage to that spell's controller", () => {
    const { game } = table();
    const derm = spawn(game, "Tephraderm");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(derm)] });
    expect(damage(game, derm)).toBe(3);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(20);
  });

  it("an opponent's spell: its controller takes it, not Tephraderm's", () => {
    const { game } = table();
    const derm = spawn(game, "Tephraderm");
    nextTurn(game);
    expect(game.state.priority.holder).toBe(B);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(derm)] });
    expect(damage(game, derm)).toBe(3);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("a noncreature permanent's ability is neither a creature nor a spell", () => {
    const { game } = table();
    const derm = spawn(game, "Tephraderm");
    const rod = spawn(game, "Rod of Ruin");
    lands(game, "Swamp", 3);
    activate(game, rod, 0, { targets: [ref(derm)] });
    expect(damage(game, derm)).toBe(1);
    expect(life(game, A)).toBe(20);
    expect(zone(game, rod)).toBe("battlefield");
  });
});
