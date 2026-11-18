/**
 * An alternative cost for a Vehicle's own crew abilities (Heart of Kiran: "You
 * may remove a loyalty counter from a planeswalker you control rather than pay
 * Heart of Kiran's crew cost") — `alternativeAbilityCost`'s `"crew"`, a second
 * activation of each of its crew abilities at that cost (rule 602.2b applying
 * 601.2b). Still a crew ability: the Vehicle becomes crewed (702.122e), by no
 * creature (702.122c), and the counter isn't a loyalty ability's (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import { entriesThisTurn } from "../journal.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, counters, pt, ref, spawn, table, types } from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offersOf = (game: Game, source: ObjectId): ActivateOffer[] =>
  game.legalActions(A).filter((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source);

const altOf = (game: Game, heart: ObjectId): ActivateOffer | undefined =>
  offersOf(game, heart).find((o) => o.text.includes("Remove a loyalty counter"));

describe("Heart of Kiran", () => {
  it("crews by a loyalty counter off your planeswalker, and becomes crewed by no creature", () => {
    const { game } = table();
    const heart = spawn(game, "Heart of Kiran", A);
    const chandra = spawn(game, "Chandra Nalaar", A);
    const before = counters(game, chandra, "loyalty");
    const alt = altOf(game, heart)!;
    expect(alt.text).toBe("Crew 3 — Remove a loyalty counter from a planeswalker you control");
    activate(game, heart, alt.abilityIndex);
    expect(counters(game, chandra, "loyalty")).toBe(before - 1);
    expect(types(game, heart)).toContain("creature");
    expect(pt(game, heart)).toEqual({ power: 4, toughness: 4 });
    expect(entriesThisTurn(game.state, "crewed").map((e) => e.object)).toEqual([heart]);
    expect(entriesThisTurn(game.state, "crews")).toEqual([]);
  });

  it("isn't a loyalty ability: the planeswalker's own may still be activated, and after one, this may", () => {
    const { game } = table();
    const heart = spawn(game, "Heart of Kiran", A);
    const chandra = spawn(game, "Chandra Nalaar", A);
    const before = counters(game, chandra, "loyalty");
    activate(game, chandra, 0, { targets: [ref(B)] });
    expect(counters(game, chandra, "loyalty")).toBe(before + 1);
    activate(game, heart, altOf(game, heart)!.abilityIndex);
    expect(counters(game, chandra, "loyalty")).toBe(before);
    expect(types(game, heart)).toContain("creature");
  });

  it("asks which planeswalker when there are two", () => {
    const { game, a } = table();
    const heart = spawn(game, "Heart of Kiran", A);
    const chandra = spawn(game, "Chandra Nalaar", A);
    const jace = spawn(game, "Jace Beleren", A);
    const jaceBefore = counters(game, jace, "loyalty");
    const chandraBefore = counters(game, chandra, "loyalty");
    let asked: readonly string[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      asked = offer.eligible.map((e) => e.object);
      return [{ object: jace, kind: "loyalty", count: 1 }];
    };
    activate(game, heart, altOf(game, heart)!.abilityIndex);
    expect([...asked].sort()).toEqual([chandra, jace].sort());
    expect(counters(game, jace, "loyalty")).toBe(jaceBefore - 1);
    expect(counters(game, chandra, "loyalty")).toBe(chandraBefore);
  });

  it("needs a planeswalker of yours, and reaches no other Vehicle's crew", () => {
    const { game } = table();
    const heart = spawn(game, "Heart of Kiran", A);
    const hauler = spawn(game, "Hoard Hauler", A);
    spawn(game, "Hill Giant", A);
    spawn(game, "Chandra Nalaar", B);
    expect(altOf(game, heart)).toBeUndefined();
    spawn(game, "Chandra Nalaar", A);
    expect(altOf(game, heart)).toBeDefined();
    expect(offersOf(game, heart).map((o) => o.text)).toHaveLength(2);
    expect(offersOf(game, hauler).map((o) => o.text)).toEqual([expect.stringMatching(/^Crew 3 \(/)]);
  });
});
