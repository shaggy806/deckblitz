/**
 * A copy's new targets (rule 707.10c) are asked over the slots the spell
 * filled — a skipped "up to" slot isn't a target (115.1) and isn't offered —
 * so each offered slot's "other than slot n" relation is renumbered to the
 * offered slots. Band Together cast with one creature of yours ("up to two")
 * left the slot numbers shifted, and its copy could never be answered
 * (`stackTargetSlots`, found by the fuzzer).
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("a copy of a spell with a skipped optional slot", () => {
  it("Band Together with only one creature of yours: its Twincast copy takes new targets", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const band = toHand(game, "Band Together");
    cast(game, band, { targets: [null, ref(bears), ref(wurm)], settle: false });
    let offered: number | undefined;
    a.chooseTargetsFn = (_view, _source, specs) => {
      offered = specs.length;
      return [ref(giant), ref(elves)];
    };
    cast(game, toHand(game, "Twincast"), { targets: [ref(band)] });
    expect(offered).toBe(2);
    // The copy: the Giant deals 3 to the Elves. Then Band Together: the
    // Bears deal 2 to the Wurm.
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });
});
