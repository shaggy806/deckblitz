/**
 * A "prevent that damage and …" replacement applies once to a simultaneous
 * damage event (rule 614.5): combat damage from several blockers at once is
 * one event (510.2), so its follow-up happens once, after it, with "that
 * many" the total prevented — Oathsworn Knight's and Unbreathing Horde's one
 * counter however many creatures block them.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, counters, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("prevent that damage and remove a counter, once per damage event", () => {
  it("Oathsworn Knight blocked by two creatures: all of it prevented, one counter removed", () => {
    const { game, a, b } = table();
    const knight = spawn(game, "Oathsworn Knight");
    game.state.objects[knight].counters["+1/+1"] = 4;
    const blockers = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    b.declareBlockersFn = () => blockers.map((blocker) => ({ blocker, attacker: knight }));
    attack(game, a, [knight]);
    expect(zone(game, knight)).toBe("battlefield");
    expect(counters(game, knight, "+1/+1")).toBe(3);
    expect(game.state.objects[knight].damageMarked).toBe(0);
  });

  it("with one counter left, the second blocker's damage is prevented too: the counter goes after", () => {
    const { game, a, b } = table();
    const knight = spawn(game, "Oathsworn Knight");
    game.state.objects[knight].counters["+1/+1"] = 1;
    const blockers = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    b.declareBlockersFn = () => blockers.map((blocker) => ({ blocker, attacker: knight }));
    const before = game.events.length;
    attack(game, a, [knight]);
    const dealtToKnight = game.events
      .slice(before)
      .filter((e) => e.type === "damage-dealt" && e.target.kind === "object" && e.target.object === knight);
    expect(dealtToKnight).toEqual([]);
    // Then the counter goes, and a 0/0 dies (rule 704.5f).
    expect(zone(game, knight)).toBe("graveyard");
    expect(game.state.players[A].life).toBe(20);
  });

  it("damage on its own, outside combat, is its own event: prevented, one counter", () => {
    const { game } = table();
    const knight = spawn(game, "Oathsworn Knight");
    game.state.objects[knight].counters["+1/+1"] = 4;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(knight)] });
    expect(counters(game, knight, "+1/+1")).toBe(3);
    expect(game.state.objects[knight].damageMarked).toBe(0);
  });
});
