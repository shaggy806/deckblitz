/**
 * Distributing counters (rule 601.2d — the `counters-divided` effect): the
 * targets and the division are chosen as the spell is cast or the ability
 * goes on the stack, at least one each; a target gone illegal loses its
 * share. Each test written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

describe("counters-divided", () => {
  it("Armament Dragon distributes three +1/+1 counters as chosen among its targets", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const dragon = toHand(game, "Armament Dragon");
    cast(game, dragon, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears), ref(elves)], division: [2, 1] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, dragon)).toBe(0);
  });

  it("Glint Weaver: a single target takes all three, then you gain the greatest toughness", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Glint Weaver"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.zones.shared.stack.length === 0);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bears)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, bears)).toBe(3);
    // Bears 2/2 + three counters = 5/5, the greatest toughness.
    expect(life(game, A)).toBe(25);
  });

  it("Stolen Goodies distributes as it's cast, and may have no targets at all", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 8);
    const ruiner = toHand(game, "Picnic Ruiner");
    cast(game, ruiner, { face: 1, targets: [ref(bears), ref(elves)], division: [1, 2] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, elves)).toBe(2);
    expect(zone(game, ruiner)).toBe("exile");
    const other = toHand(game, "Picnic Ruiner");
    cast(game, other, { face: 1, targets: [] });
    expect(zone(game, other)).toBe("exile");
  });
});
