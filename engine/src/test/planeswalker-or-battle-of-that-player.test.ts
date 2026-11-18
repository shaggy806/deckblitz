/**
 * "Target planeswalker that player controls or battle that player protects"
 * (Rampaging Raptor): a `one-of` slot of a `whose: "trigger-player"`
 * planeswalker and a `protectedBy: "trigger-player"` battle — the battle's
 * protector (rule 310.8) is the damaged opponent, whoever controls it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, cast, counters, lands, spawn, table, toHand, watchTargets, zone } from "./harness.js";

const RAPTOR = "Rampaging Raptor";

/** Alice casts Invasion of Lorwyn, protected by `protector`. */
function invade(game: Game, a: { chooseCreatureTypeFn?: unknown }, protector: typeof B): ObjectId {
  (a as { chooseCreatureTypeFn: () => unknown }).chooseCreatureTypeFn = () => protector;
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

describe("Rampaging Raptor: a planeswalker that player controls or a battle that player protects", () => {
  it("offers the damaged opponent's planeswalkers and the battles they protect, nobody else's", () => {
    const { game, a } = table({ players: 3 });
    const bobsBattle = invade(game, a, B); // alice's Siege, bob protects it
    const raptor = spawn(game, RAPTOR, A, { sick: false });
    const bobsWalker = spawn(game, "Saheeli Rai", B);
    const carolsWalker = spawn(game, "Saheeli Rai", C);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot.find((id) => id === bobsBattle) ?? null));
    attack(game, a, [raptor], B);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([bobsBattle, bobsWalker].sort());
    expect(seen.offered[0]).not.toContain(carolsWalker);
    // Four combat damage to bob, then that much to the battle: 5 - 4.
    expect(counters(game, bobsBattle, "defense")).toBe(1);
  });

  it("a battle another opponent protects isn't offered", () => {
    const { game, a } = table({ players: 3 });
    const carolsBattle = invade(game, a, C);
    const raptor = spawn(game, RAPTOR, A, { sick: false });
    const bobsWalker = spawn(game, "Saheeli Rai", B);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    attack(game, a, [raptor], B);
    // One legal target, so it's taken without asking: bob's Saheeli (3
    // loyalty) takes the 4, and carol's battle is untouched.
    expect(seen.asked).toBe(0);
    expect(zone(game, bobsWalker)).toBe("graveyard");
    expect(counters(game, carolsBattle, "defense")).toBe(5);
  });
});
