/**
 * "The next time that creature would deal combat damage this turn, it deals
 * double that damage instead" / "…prevent that damage" (Impulsive
 * Maneuvers): a `replacement-effect` shield (`next: true`, `fromObject`) on
 * one creature's next combat damage, made by a coin flip for each creature
 * that attacks. All the combat damage it deals at once is one event (rule
 * 510.2), so the whole of it is doubled or prevented and the shield is spent
 * (615.8); with double strike, that's the first-strike damage.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, life, ref, spawn, table } from "./harness.js";

const DOUBLE: EffectSpec = {
  kind: "replacement-effect",
  replacement: { event: "would-deal-damage", combat: true, instead: { modify: { times: 2 } } },
  duration: "end-of-turn",
  next: true,
  fromObject: 0,
};
const PREVENT: EffectSpec = {
  kind: "replacement-effect",
  replacement: { event: "would-deal-damage", combat: true, instead: { prevent: true } },
  duration: "end-of-turn",
  next: true,
  fromObject: 0,
};

const shield = (game: Game, effect: EffectSpec, creature: ObjectId): void => game.debugApplyEffect(A, effect, [ref(creature)]);

const flips = (game: Game): boolean[] =>
  game.state.eventLog.flatMap((e) => (e.type === "coin-flipped" && e.won !== undefined ? [e.won] : []));

describe("Impulsive Maneuvers — a coin flip for each attacker", () => {
  it("doubles a won flip's attacker's damage and prevents a lost one's, one flip a creature", () => {
    const seen = new Set<boolean>();
    for (let seed = 1; seed <= 12 && seen.size < 2; seed += 1) {
      const { game, a } = table({ seed });
      spawn(game, "Impulsive Maneuvers", A);
      const bears = spawn(game, "Grizzly Bears", A);
      const goblin = spawn(game, "Raging Goblin", A);
      attack(game, a, [bears, goblin]);
      const [first, second] = flips(game);
      expect(flips(game)).toHaveLength(2);
      // Each attacker's flip is its own; together they take 2 + 1, each
      // doubled or prevented. The order of the two triggers is alice's, so
      // read the outcome as a multiset.
      const dealt = 20 - life(game, B);
      const options = [
        (first ? 4 : 0) + (second ? 2 : 0),
        (first ? 2 : 0) + (second ? 4 : 0),
      ];
      expect(options).toContain(dealt);
      seen.add(first);
      seen.add(second);
    }
    expect([...seen].sort()).toEqual([false, true]);
  });

  it("flips for an opponent's attackers too — the enchantment's controller wins or loses", () => {
    const { game, b } = table();
    spawn(game, "Impulsive Maneuvers", A);
    // Bob's turn: his creature attacks alice.
    const bears = spawn(game, "Grizzly Bears", B);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    attack(game, b, [bears], A);
    const [won] = flips(game);
    expect(flips(game)).toHaveLength(1);
    expect(game.state.eventLog.find((e) => e.type === "coin-flipped")?.player).toBe(A);
    expect(life(game, A)).toBe(won ? 16 : 20);
  });
});

describe("the next time a creature would deal combat damage this turn", () => {
  it("doubles all of one event — a trampler's damage to its blocker and to the player", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Colossal Dreadmaw", A);
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, DOUBLE, wurm);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: wurm }];
    attack(game, a, [wurm]);
    // 2 to the blocker and 4 tramples over, each doubled: 8 to bob.
    expect(life(game, B)).toBe(12);
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.activeReplacements).toHaveLength(0);
  });

  it("with double strike, only the first-strike damage is doubled", () => {
    const { game, a } = table();
    const ace = spawn(game, "Fencing Ace", A);
    shield(game, DOUBLE, ace);
    attack(game, a, [ace]);
    expect(life(game, B)).toBe(17);
  });

  it("a lost flip prevents only the next one", () => {
    const { game, a } = table();
    const ace = spawn(game, "Fencing Ace", A);
    shield(game, PREVENT, ace);
    attack(game, a, [ace]);
    expect(life(game, B)).toBe(19);
  });

  it("waits for combat damage: a noncombat hit first is untouched", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    shield(game, DOUBLE, bears);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)], { source: bears });
    expect(life(game, B)).toBe(19);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
  });

  it("is over at end of turn, unused", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    shield(game, DOUBLE, bears);
    expect(game.state.activeReplacements).toHaveLength(1);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(game.state.activeReplacements).toHaveLength(0);
  });
});
