/**
 * A card put onto the battlefield as an enchantment in addition to its
 * other types (look-and-choose's `enterAs: { addTypes }`, rule 614.12) with
 * a counter on it — Arbiter of the Ideal's inspired trigger. The permanent is
 * an enchantment as it enters, so constellation sees it (the ruling), and
 * stays one with the counter gone; a card of another type, or one declined,
 * stays on top of the library.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, counters, hand, pickFromZone, ref, settle, spawn, table, toLibrary, types, zone } from "./harness.js";

/** The Arbiter, tapped, untapped by an effect: its inspired trigger. */
function untap(game: Game, arbiter: ObjectId): void {
  game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(arbiter)]);
  settle(game);
}

describe("Arbiter of the Ideal", () => {
  it("puts a creature card onto the battlefield with a manifestation counter, an enchantment as it enters", () => {
    const { game, a } = table();
    const arbiter = spawn(game, "Arbiter of the Ideal", A, { tapped: true });
    spawn(game, "Eidolon of Blossoms");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    const handBefore = hand(game).length;
    untap(game, arbiter);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "manifestation")).toBe(1);
    expect(types(game, bears)).toEqual(expect.arrayContaining(["creature", "enchantment"]));
    // Eidolon of Blossoms' constellation: an enchantment entered.
    expect(hand(game).length).toBe(handBefore + 1);
    // Still an enchantment with the counter gone.
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "manifestation", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(counters(game, bears, "manifestation")).toBe(0);
    expect(types(game, bears)).toContain("enchantment");
  });

  it("a card of another type is revealed and stays on top", () => {
    const { game, a } = table();
    const arbiter = spawn(game, "Arbiter of the Ideal", A, { tapped: true });
    const shock = toLibrary(game, "Shock");
    const seen = pickFromZone(a);
    untap(game, arbiter);
    expect(seen.offered).toEqual([]);
    expect(zone(game, shock)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(shock);
  });

  it("declined, the land card stays on top", () => {
    const { game, a } = table();
    const arbiter = spawn(game, "Arbiter of the Ideal", A, { tapped: true });
    const forest = toLibrary(game, "Forest");
    pickFromZone(a);
    untap(game, arbiter);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(forest);
  });
});
