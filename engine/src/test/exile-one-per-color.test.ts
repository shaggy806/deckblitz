/**
 * "For each of those colors, you may exile a card of that color from among
 * the revealed cards" (Sanar, Innovative First-Year): a zone choice's
 * `together: { oneEachColorAmong }`, a slot a colour among the chooser's
 * matching permanents, each card filling a slot of a colour it has, one card a
 * slot. Sanar reveals until X nonland cards (`reveal-until-count`, the rest
 * staying), exiles the picks, shuffles, and lets them be cast this turn.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, lands, pickFromZone, ref, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

/** Alice's library, top last: what her next draw step takes on top. */
function stack(game: Game, names: readonly string[]): ObjectId[] {
  const ids = [...names].reverse().map((name) => toLibrary(game, name, A));
  toLibrary(game, "Plains", A); // drawn in her draw step
  return ids.reverse();
}

describe("Sanar, Innovative First-Year", () => {
  it("reveals until X nonland cards and exiles one a colour, castable this turn", () => {
    const { game, a } = table();
    spawn(game, "Sanar, Innovative First-Year");
    spawn(game, "Llanowar Elves"); // blue, red and green: X is 3
    const [forest, bolt, counter, island, growth, below] = stack(game, [
      "Forest",
      "Lightning Bolt",
      "Counterspell",
      "Island",
      "Giant Growth",
      "Shivan Dragon",
    ]);
    const seen = pickFromZone(a, bolt, counter, growth);
    toStep(game, "precombat-main");
    settle(game);
    // Shivan Dragon was never revealed; the two lands were, and can't fill
    // a colour.
    expect([...seen.offered].sort()).toEqual([bolt, counter, growth].sort());
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, counter)).toBe("exile");
    expect(zone(game, growth)).toBe("exile");
    expect(zone(game, forest)).toBe("library");
    expect(zone(game, island)).toBe("library");
    expect(zone(game, below)).toBe("library");
    lands(game, "Mountain", 1);
    expect(castable(game, bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(game.state.players[B].life).toBe(17);
  });

  it("takes one card a colour: two red cards fill one slot, a blue-red one the other", () => {
    const { game, a } = table();
    spawn(game, "Sanar, Innovative First-Year"); // blue and red: X is 2
    const [bolt, shock, charm] = stack(game, ["Lightning Bolt", "Shock", "Izzet Charm"]);
    // Only Bolt and Shock are revealed; both red, only one may go (an answer
    // asking for both is cut to what the slots hold).
    pickFromZone(a, bolt, shock);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, shock)).toBe("library");
    const { game: other, a: alice } = table();
    spawn(other, "Sanar, Innovative First-Year");
    const [charm2, bolt2] = stack(other, ["Izzet Charm", "Lightning Bolt"]);
    pickFromZone(alice, charm2, bolt2);
    toStep(other, "precombat-main");
    settle(other);
    expect(zone(other, charm2)).toBe("exile");
    expect(zone(other, bolt2)).toBe("exile");
    expect(zone(game, charm)).toBe("library");
  });
});
