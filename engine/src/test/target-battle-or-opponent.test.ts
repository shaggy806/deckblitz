/**
 * "Another target battle or opponent" (Invasion of Regatha): one slot, an
 * `other` over a battle `permanent` with `orPlayer: "opponent"` — no engine
 * code. And its back face's "if a noncreature source you control would deal
 * damage to a creature, battle, or opponent, it deals that much damage plus 2
 * instead" (Disciples of the Inferno): two `would-deal-damage` statics.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, cast, counters, enter, lands, life, pickTargets, spawn, table, toHand, watchTargets, zone } from "./harness.js";

/** A transforming card's back face on the battlefield. */
function back(game: Game, front: string, player: PlayerId = A): ObjectId {
  const id = spawn(game, front, player);
  const object = game.state.objects[id];
  object.face = 1;
  delete object.counters.defense;
  invalidateComputedCache();
  return id;
}

describe("Invasion of Regatha", () => {
  it("deals 4 to an opponent and 1 to up to one creature", () => {
    const { game, a } = table({ players: 3 });
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, C, elves);
    enter(game, "Invasion of Regatha");
    expect(life(game, C)).toBe(16);
    expect(life(game, B)).toBe(20);
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("offers another battle and opponents — never itself, never you, never a creature", () => {
    const { game, a } = table({ players: 3 });
    const other = spawn(game, "Invasion of Kylem", B);
    const defense = counters(game, other, "defense");
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, (offered) => [offered[0].includes(other) ? other : null, null]);
    const siege = enter(game, "Invasion of Regatha");
    expect(seen.asked).toBeGreaterThan(0);
    expect([...seen.offered[0]].sort()).toEqual([other, B, C].sort());
    expect(seen.offered[0]).not.toContain(siege);
    expect(seen.offered[0]).not.toContain(A);
    expect(seen.offered[0]).not.toContain(bears);
    // 4 damage to a battle takes 4 defense counters off it (rule 120.3h).
    expect(defense).toBe(5);
    expect(counters(game, other, "defense")).toBe(1);
  });
});

describe("Disciples of the Inferno", () => {
  it("adds 2 to a noncreature source's damage to an opponent, a creature or a battle", () => {
    const { game } = table({ players: 3 });
    back(game, "Invasion of Regatha");
    const giant = spawn(game, "Hill Giant", B);
    const siege = spawn(game, "Invasion of Kylem", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(15);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "object", object: giant }] });
    expect(zone(game, giant)).toBe("graveyard");
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "object", object: siege }] });
    // 5 defense, 2 + 2 damage.
    expect(counters(game, siege, "defense")).toBe(1);
  });

  it("doesn't touch damage to you, nor a creature's damage", () => {
    const { game } = table({ players: 2 });
    back(game, "Invasion of Regatha");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: A }] });
    expect(life(game, A)).toBe(17);
    // A creature source: Prodigal Pyromancer pings for 1, unchanged.
    const bolter = spawn(game, "Prodigal Pyromancer");
    game.state.objects[bolter].summoningSick = false;
    invalidateComputedCache();
    activate(game, bolter, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(19);
  });
});
