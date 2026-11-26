/**
 * A reflexive ability (rule 603.12) keeps the trigger player of the ability
 * that created it, so its `whose: "trigger-player"` slot reads "that
 * player's graveyard" — Memory Vampire's "Whenever this creature deals
 * combat damage to a player, any number of target players each mill that
 * many cards. Then you may collect evidence 9. When you do, you may cast
 * target nonland card from defending player's graveyard without paying its
 * mana cost."
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, attack, controller, graveyard, pickFromZone, pickModes, ref, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Memory Vampire", () => {
  it("mills the chosen players that many; the reflexive cast offers the damaged player's nonland cards only", () => {
    const { game, a } = table({ players: 3 });
    const vampire = spawn(game, "Memory Vampire");
    const giant = toGraveyard(game, "Hill Giant"); // 4
    const angel = toGraveyard(game, "Serra Angel"); // 5
    const forest = toGraveyard(game, "Forest", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const theirGiant = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Hill Giant", C);
    const before = { b: graveyard(game, B).length, c: graveyard(game, C).length };
    pickModes(a, 0);
    pickFromZone(a, giant, angel);
    const offered: (readonly (ObjectId | PlayerId)[])[][] = [];
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      offered.push(legal.map((slot) => slot.map((t) => (t.kind === "object" ? t.object : t.player))));
      return offered.length === 1 ? [ref(B), ref(C)] : [ref(bears)];
    };
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, free: true };
    };
    attack(game, a, [vampire]);
    // Four damage: B and C each mill four.
    expect(graveyard(game, C).length - before.c).toBe(4);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, angel)).toBe("exile");
    // The reflexive slot: B's nonland cards only (the milled Wastes are lands too), none of C's.
    expect(offered).toHaveLength(2);
    expect([...offered[1][0]].sort()).toEqual([bears, theirGiant].sort());
    expect(offered[1][0]).not.toContain(forest);
    // Cast free: the Bears enter under alice's control.
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(graveyard(game, B).length - before.b).toBe(4 - 1);
  });

  it("with no target players it still collects evidence; without 9 mana value it can't", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Memory Vampire");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 0);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [vampire]);
    expect(asked).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
