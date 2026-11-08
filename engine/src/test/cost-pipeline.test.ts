/**
 * Theme 4 of docs/plans/need-key-themes.md: cost modifiers read `EffectAmount`s
 * and one spell clause, and effects can be costs.
 */
import { describe, expect, it } from "vitest";
import { POOL_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { activate, counters, lands, nextTurn, spawn, table } from "./harness.js";

function valuesAt(value: unknown, key: string, out: unknown[] = []): unknown[] {
  if (value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const v of value) valuesAt(v, key, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === key) out.push(v);
    valuesAt(v, key, out);
  }
  return out;
}

/** Field names only the deleted shapes had. An object declared `as const` and
 * used later isn't excess-checked, so a leftover would be silently ignored. */
const REMOVED = [
  "cardsInGraveyard",
  "greatestOpponentCount",
  "playersInGame",
  "scaled",
  "sameNameAsSpell",
  "alternativeEquipCost",
  "alternativeCyclingCost",
];

describe("the pool on the cost pipeline", () => {
  it("spells no shape the pipeline replaced", () => {
    const bad: string[] = [];
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const key of REMOVED) if (valuesAt(def, key).length > 0) bad.push(`${def.name}: ${key}`);
      for (const mod of valuesAt(def, "costModification") as Record<string, unknown>[]) {
        for (const key of ["caster", "castFrom", "castFromAnyones", "notFromCastersHand", "firstEachTurn", "exceptOnCastersTurn"]) {
          if (key in mod) bad.push(`${def.name}: costModification.${key}`);
        }
      }
      for (const grant of valuesAt(def, "alternativeCostForSpells") as Record<string, unknown>[]) {
        for (const key of ["fromHand", "fromZones", "yourTurnOnly"]) if (key in grant) bad.push(`${def.name}: ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("power-up abilities", () => {
  const ready = (name: string) => {
    const t = table();
    const id = spawn(t.game, name);
    nextTurn(t.game); // Bob's
    nextTurn(t.game); // Alice's: it didn't enter this turn
    return { ...t, id };
  };

  it("Hulk takes {3} off another creature's power-up, not his own", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    spawn(game, "Hulk, Gamma Goliath");
    lands(game, "Mountain", 4);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(2);
  });

  it("Hulk doesn't discount his own power-up", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    lands(game, "Taiga", 5);
    expect(() => activate(game, id, 0)).toThrow(/mana|pay/i);
  });

  it("without Hulk the same activation can't be paid", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    lands(game, "Mountain", 4);
    expect(() => activate(game, id, 0)).toThrow(/mana|pay/i);
  });

  it("Advancing the Spirit: the first power-up each of your turns for {0}, once", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    const second = spawn(game, "Kang the Conqueror");
    spawn(game, "Advancing the Spirit");
    activate(game, id, 1); // the copy at {0}
    expect(counters(game, id)).toBe(5);
    // Used up, by the copy, at either cost.
    lands(game, "Taiga", 8);
    expect(() => activate(game, id, 0)).toThrow(/only once/);
    // And no second free one this turn: Kang has no second ability left to name.
    expect(() => activate(game, second, 1)).toThrow();
  });

  it("Advancing the Spirit does nothing on another player's turn", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    spawn(game, "Advancing the Spirit");
    nextTurn(game);
    expect(() => activate(game, id, 1)).toThrow();
  });

  it("Wonder Man: each power-up can be activated one more time", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    lands(game, "Mountain", 14);
    activate(game, id, 0);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(4);
    expect(() => activate(game, id, 0)).toThrow(/only once/);
  });

  it("Kang: no power-up abilities during the extra turn", () => {
    const { game, id } = ready("Kang the Conqueror");
    const other = spawn(game, "Abomination, Terrifying Titan");
    lands(game, "Island", 8);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(1);
    nextTurn(game);
    lands(game, "Taiga", 7);
    expect(() => activate(game, other, 0)).toThrow(/can't be activated this turn/);
  });
});
