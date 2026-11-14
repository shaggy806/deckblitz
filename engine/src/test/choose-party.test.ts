/**
 * Stick Together's "each player chooses a party from among creatures they
 * control, then sacrifices the rest" (rule 700.8d): `choose-one-of-each`'s
 * `slots: "party"` — up to one each of Cleric, Rogue, Warrior and Wizard, a
 * creature one member only (700.8b). Written from the card's Oracle text and
 * the rules.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, spawn, table, toHand, zone } from "./harness.js";

/** The seat answers each choose-permanents with those of `ids` it's offered;
 * records each offer. */
function keep(seat: ScriptedController, ...ids: readonly ObjectId[]): { offers: (readonly ObjectId[])[]; maxes: number[] } {
  const seen = { offers: [] as (readonly ObjectId[])[], maxes: [] as number[] };
  seat.choosePermanentsFn = (_view, eligible, _min, max) => {
    seen.offers.push(eligible);
    seen.maxes.push(max);
    return ids.filter((id) => eligible.includes(id));
  };
  return seen;
}

describe("Stick Together", () => {
  it("each player keeps a party, one creature per type, and sacrifices the rest", () => {
    const { game, a, b } = table();
    const cleric = spawn(game, "Anointer Priest", A);
    const wizard = spawn(game, "Ana Disciple", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const warrior = spawn(game, "Ash Zealot", B);
    const theirBears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    const mine = keep(a, cleric, wizard);
    const theirs = keep(b, warrior);
    cast(game, toHand(game, "Stick Together"));
    // Only the creatures of a party type are offered.
    expect([...mine.offers[0]].sort()).toEqual([cleric, wizard].sort());
    expect(theirs.offers).toEqual([[warrior]]);
    expect(zone(game, cleric)).toBe("battlefield");
    expect(zone(game, wizard)).toBe("battlefield");
    expect(zone(game, warrior)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("graveyard");
  });

  it("two of one type can't both be kept", () => {
    const { game, a } = table();
    const one = spawn(game, "Ana Disciple", A);
    const two = spawn(game, "Ana Disciple", A);
    lands(game, "Plains", 5);
    // Both picked: the answer is held to the party, the first kept.
    const seen = keep(a, one, two);
    cast(game, toHand(game, "Stick Together"));
    expect(seen.maxes).toEqual([1]);
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("graveyard");
  });

  it("a changeling is a party member for one type only (rule 700.8b): two of them and a Cleric keep three", () => {
    const { game, a } = table();
    const one = spawn(game, "Universal Automaton", A);
    const two = spawn(game, "Changeling Outcast", A);
    const cleric = spawn(game, "Anointer Priest", A);
    lands(game, "Plains", 5);
    const seen = keep(a, one, two, cleric);
    cast(game, toHand(game, "Stick Together"));
    expect(seen.maxes).toEqual([3]);
    expect([one, two, cleric].map((id) => zone(game, id))).toEqual(["battlefield", "battlefield", "battlefield"]);
  });

  it("a party may be smaller than it could be: keeping none sacrifices them all", () => {
    const { game, a } = table();
    const disciple = spawn(game, "Ana Disciple", A);
    lands(game, "Plains", 5);
    const seen = keep(a);
    cast(game, toHand(game, "Stick Together"));
    expect(seen.offers.length).toBe(1);
    expect(zone(game, disciple)).toBe("graveyard");
  });
});
