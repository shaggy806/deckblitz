/**
 * Mana spent "of any of that spell's colors" (`ManaSpentClause.ofItsColors`):
 * Boreal Outrider's "Whenever you cast a creature spell, if {S} of any of that
 * spell's colors was spent to cast it, that creature enters with an additional
 * +1/+1 counter on it" — the snow mana (rule 107.4h) counted only where it's
 * mana of one of the spell's colors (rule 105.2), written from its rulings.
 */
import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, named, ref, spawn, table, toHand } from "./harness.js";

describe("Boreal Outrider", () => {
  it("snow mana of the creature spell's color spent: it enters with an additional +1/+1 counter", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Forest", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    const [bears] = named(game, "Grizzly Bears", A);
    expect(counters(game, bears)).toBe(1);
  });

  it("snow mana of another color isn't enough: green Bears paid with a Snow-Covered Island's {U}", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Island", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    const [bears] = named(game, "Grizzly Bears", A);
    expect(counters(game, bears)).toBe(0);
  });

  it("no snow mana spent: no counter", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const [bears] = named(game, "Grizzly Bears", A);
    expect(counters(game, bears)).toBe(0);
  });

  it("any of a multicolored spell's colors counts: Watchwolf paid with a Snow-Covered Plains", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Plains", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Watchwolf"));
    const [wolf] = named(game, "Watchwolf", A);
    expect(counters(game, wolf)).toBe(1);
  });

  it("a colorless creature spell has no colors for the snow mana to match", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Forest", 2);
    cast(game, toHand(game, "Alpha Myr"));
    const [myr] = named(game, "Alpha Myr", A);
    expect(counters(game, myr)).toBe(0);
  });

  it("one counter however much snow mana of its colors was spent; two Outriders trigger separately", () => {
    const { game } = table();
    spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, named(game, "Grizzly Bears", A)[0])).toBe(1);

    const second = table();
    spawn(second.game, "Boreal Outrider");
    spawn(second.game, "Boreal Outrider");
    lands(second.game, "Snow-Covered Forest", 1);
    lands(second.game, "Forest", 1);
    cast(second.game, toHand(second.game, "Grizzly Bears"));
    expect(counters(second.game, named(second.game, "Grizzly Bears", A)[0])).toBe(2);
  });

  it("only creature spells", () => {
    const { game } = table();
    const outrider = spawn(game, "Boreal Outrider");
    lands(game, "Snow-Covered Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(outrider)] });
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(counters(game, outrider)).toBe(0);
  });
});
