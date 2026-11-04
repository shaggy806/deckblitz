/**
 * Ulamog, the Defiler: the exiled half of a library, a ward of two sacrificed
 * permanents, counters off the greatest mana value in exile, and annihilator X
 * (`annihilator(amount, text)`, rule 702.86a) read as its trigger resolves.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, cast, lands, settle, spawn, table, toHand, zone } from "./harness.js";
import type { PlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

type G = ReturnType<typeof table>["game"];
const toExile = (game: G, name: string, player: PlayerId = B): ObjectId => game.debugSpawn(name, player, "exile");
const plusCounters = (game: G, id: ObjectId): number => game.state.objects[id].counters["+1/+1"] ?? 0;

describe("Ulamog, the Defiler", () => {
  it("exiles the top half of the target opponent's library, rounded up, before it resolves", () => {
    const { game } = table();
    lands(game, "Wastes", 10);
    const ulamog = toHand(game, "Ulamog, the Defiler");
    const library = game.state.zones.perPlayer[B].library.length;
    expect(library % 2).toBe(1);
    const top = game.state.zones.perPlayer[B].library[0];
    cast(game, ulamog, { settle: false });
    // The trigger is above the spell: resolve it alone.
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(zone(game, ulamog)).toBe("stack");
    expect(game.state.zones.perPlayer[B].library.length).toBe((library - 1) / 2);
    expect(zone(game, top)).toBe("exile");
    settle(game);
    // Every card in exile is a Wastes, mana value 0.
    expect(zone(game, ulamog)).toBe("battlefield");
    expect(plusCounters(game, ulamog)).toBe(0);
  });

  it("enters with counters for the greatest mana value among cards in exile, whoever's", () => {
    const { game } = table();
    lands(game, "Wastes", 10);
    toExile(game, "Serra Angel", B);
    toExile(game, "Grizzly Bears", A);
    const ulamog = toHand(game, "Ulamog, the Defiler");
    cast(game, ulamog);
    expect(zone(game, ulamog)).toBe("battlefield");
    expect(plusCounters(game, ulamog)).toBe(5);
    expect(game.state.objects[ulamog].counters["+1/+1"]).toBe(5);
  });

  it("entering directly from exile, it sees itself (its ruling)", () => {
    const { game } = table();
    const ulamog = spawn(game, "Ulamog, the Defiler", A);
    lands(game, "Plains", 1);
    const ephemerate = toHand(game, "Ephemerate");
    cast(game, ephemerate, { targets: [{ kind: "object", object: ulamog }] });
    expect(zone(game, ulamog)).toBe("battlefield");
    expect(plusCounters(game, ulamog)).toBe(10);
  });

  it("annihilator X sacrifices as many permanents as it has counters as the trigger resolves", () => {
    const { game, a, b } = table();
    const ulamog = spawn(game, "Ulamog, the Defiler", A);
    game.state.objects[ulamog].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    const kept = spawn(game, "Forest", B);
    b.chooseSacrificesFn = () => [bears, forest];
    attack(game, a, [ulamog]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, kept)).toBe("battlefield");
  });

  it("annihilator X with no counters sacrifices nothing", () => {
    const { game, a } = table();
    const ulamog = spawn(game, "Ulamog, the Defiler", A);
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [ulamog]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("ward: a spell is countered unless its caster sacrifices two permanents", () => {
    const { game, a } = table();
    const ulamog = spawn(game, "Ulamog, the Defiler", B);
    lands(game, "Mountain", 1);
    const fodder = spawn(game, "Grizzly Bears", A);
    const fodder2 = spawn(game, "Forest", A);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [{ kind: "object", object: ulamog }], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    a.chooseSacrificesFn = () => [fodder, fodder2];
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, fodder2)).toBe("graveyard");
    expect(game.state.objects[ulamog].damageMarked).toBe(3);
  });

  it("ward: with fewer than two permanents to sacrifice, the spell's countered", () => {
    const { game } = table();
    const ulamog = spawn(game, "Ulamog, the Defiler", B);
    // Its one Mountain, tapped to pay: not enough on its own.
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [{ kind: "object", object: ulamog }] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.objects[ulamog].damageMarked).toBe(0);
    expect(game.eventsOfType("spell-countered")).toHaveLength(1);
  });
});
