/**
 * "When you sacrifice this permanent" — the `sacrifice` trigger's `selfOnly`
 * (the Theros Ordeals). It fires however the source was sacrificed (the
 * Ordeals' ruling), looking back to it as it left (rule 603.10a), and never
 * for another permanent sacrificed.
 */
import { describe, expect, it } from "vitest";

import { A, cast, enter, hand, lands, life, ref, settle, spawn, table, toHand, attack, zone, counters } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function sacrificeToAuratog(game: Game, auratog: ObjectId, victim: ObjectId): void {
  game.dispatch({ type: "activate-ability", player: A, source: auratog, abilityIndex: 0, targets: [], sacrifice: victim });
  settle(game);
}

describe("sacrifice trigger, selfOnly", () => {
  it("Ordeal of Heliod: the third counter sacrifices it as the attack trigger resolves, and you gain 10", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears");
    const hunter = enter(game, "Reverent Hunter");
    expect(counters(game, hunter)).toBe(2);
    const ordeal = toHand(game, "Ordeal of Heliod");
    cast(game, ordeal, { targets: [ref(hunter)] });
    const before = life(game);
    attack(game, a, [hunter]);
    expect(counters(game, hunter)).toBe(3);
    expect(zone(game, ordeal)).toBe("graveyard");
    expect(life(game)).toBe(before + 10);
  });

  it("Ordeal of Heliod: fewer than three counters, it stays", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const ordeal = toHand(game, "Ordeal of Heliod");
    cast(game, ordeal, { targets: [ref(bears)] });
    const before = life(game);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, ordeal)).toBe("battlefield");
    expect(life(game)).toBe(before);
  });

  it("Ordeal of Thassa sacrificed some other way still draws two (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const auratog = spawn(game, "Auratog");
    const ordeal = toHand(game, "Ordeal of Thassa");
    cast(game, ordeal, { targets: [ref(bears)] });
    const before = hand(game).length;
    sacrificeToAuratog(game, auratog, ordeal);
    expect(zone(game, ordeal)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("another enchantment sacrificed doesn't fire it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const auratog = spawn(game, "Auratog");
    const ordeal = toHand(game, "Ordeal of Thassa");
    cast(game, ordeal, { targets: [ref(bears)] });
    const other = spawn(game, "Hopeful Eidolon");
    const before = hand(game).length;
    sacrificeToAuratog(game, auratog, other);
    expect(zone(game, ordeal)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});
