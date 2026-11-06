/**
 * "Then discard two cards unless you discard an artifact card" (Thirst for
 * Knowledge): the `discard` effect's `unlessOne` — one matching card is a
 * whole answer, or `amount` cards of any kind (two artifacts included, the
 * ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, hand, lands, quiet, table, toHand, zone } from "./harness.js";

/** Thirst for Knowledge cast and resolved up to its discard. Wastes in the
 * library: nothing drawn is an artifact. */
function thirst(): { game: Game; ring: ObjectId; bolt: ObjectId; shock: ObjectId; before: number } {
  const { game } = table();
  lands(game, "Island", 3);
  const ring = toHand(game, "Sol Ring");
  const bolt = toHand(game, "Lightning Bolt");
  const shock = toHand(game, "Shock");
  const spell = toHand(game, "Thirst for Knowledge");
  const before = hand(game).length;
  cast(game, spell, { settle: false });
  game.advanceUntil((s) => s.awaiting?.kind === "discard" || quiet(s));
  return { game, ring, bolt, shock, before };
}

describe("discard N unless you discard one card of a kind (Thirst for Knowledge)", () => {
  it("draws three, then offers the artifact card alone as an answer", () => {
    const { game, ring, bolt, shock, before } = thirst();
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("discard");
    if (awaiting?.kind !== "discard") return;
    expect(awaiting.count).toBe(2);
    expect(awaiting.orOneOf).toEqual([ring]);
    // The spell cast, three Wastes drawn.
    expect(hand(game)).toHaveLength(before - 1 + 3);
    game.dispatch({ type: "discard", player: A, cards: [ring] });
    game.advanceUntil(quiet);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, shock)).toBe("hand");
    expect(hand(game)).toHaveLength(before - 1 + 3 - 1);
  });

  it("refuses one nonartifact card, and takes any two", () => {
    const { game, ring, bolt, shock } = thirst();
    expect(() => game.dispatch({ type: "discard", player: A, cards: [bolt] })).toThrow(/exactly 2/);
    game.dispatch({ type: "discard", player: A, cards: [bolt, shock] });
    game.advanceUntil(quiet);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, ring)).toBe("hand");
  });

  it("takes two artifact cards if you want (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ring = toHand(game, "Sol Ring");
    const vault = toHand(game, "Mind Stone");
    cast(game, toHand(game, "Thirst for Knowledge"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "discard" || quiet(s));
    game.dispatch({ type: "discard", player: A, cards: [ring, vault] });
    game.advanceUntil(quiet);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, vault)).toBe("graveyard");
  });
});
