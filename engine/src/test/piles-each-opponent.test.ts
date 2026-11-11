/**
 * `separate-into-piles`' `each`: every player of a scope separates their own,
 * then a pile of each is chosen, then every chosen pile meets its fate at
 * once (rule 608.2e) — Make an Example.
 */
import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, spawn, table, toHand, zone } from "./harness.js";

describe("Make an Example", () => {
  it("every opponent separates, then you choose a pile of each, then all are sacrificed at once", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 4);
    const mine = spawn(game, "Grizzly Bears", A);
    const bBears = spawn(game, "Grizzly Bears", B);
    const bElves = spawn(game, "Llanowar Elves", B);
    const bLand = spawn(game, "Island", B);
    const cAngel = spawn(game, "Serra Angel", C);
    const cElves = spawn(game, "Llanowar Elves", C);
    const order: string[] = [];
    b.separatePilesFn = (_view, offer) => {
      order.push("b separates");
      expect([...offer.objects].sort()).toEqual([bBears, bElves].sort());
      expect(offer.chooser).toBe(A);
      expect(offer.fates).toEqual({ chosen: "lose" });
      return [[bBears], [bElves]];
    };
    c.separatePilesFn = (_view, offer) => {
      order.push("c separates");
      expect([...offer.objects].sort()).toEqual([cAngel, cElves].sort());
      return [[], [cAngel, cElves]];
    };
    const asked: PlayerId[] = [];
    a.choosePileFn = (_view, offer) => {
      order.push(`a chooses ${offer.separator}'s`);
      asked.push(offer.separator);
      // Nothing has been sacrificed while a choice is still to make.
      for (const id of [bBears, bElves, cAngel, cElves]) expect(zone(game, id)).toBe("battlefield");
      return offer.separator === B ? 0 : 1;
    };
    cast(game, toHand(game, "Make an Example"));
    expect(order).toEqual(["b separates", "c separates", `a chooses ${B}'s`, `a chooses ${C}'s`]);
    expect(zone(game, bBears)).toBe("graveyard");
    expect(zone(game, bElves)).toBe("battlefield");
    expect(zone(game, cAngel)).toBe("graveyard");
    expect(zone(game, cElves)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, bLand)).toBe("battlefield");
    const sacrificed = game.state.eventLog.filter((e) => e.type === "permanent-sacrificed");
    expect(sacrificed.length).toBe(3);
  });

  it("an opponent with no creatures has two empty piles: nobody is asked about them", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 4);
    const cElves = spawn(game, "Llanowar Elves", C);
    b.separatePilesFn = () => {
      throw new Error("bob has nothing to separate");
    };
    c.separatePilesFn = () => [[cElves], []];
    const asked: PlayerId[] = [];
    a.choosePileFn = (_view, offer) => {
      asked.push(offer.separator);
      return 1;
    };
    cast(game, toHand(game, "Make an Example"));
    expect(asked).toEqual([C]);
    // The empty pile was chosen: nothing is sacrificed.
    expect(zone(game, cElves)).toBe("battlefield");
  });

  it("at two players it's the one opponent's piles and your choice", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    b.separatePilesFn = () => [[bears], [elves]];
    a.choosePileFn = () => 1;
    cast(game, toHand(game, "Make an Example"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("graveyard");
  });
});
