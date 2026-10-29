/**
 * The `switch-pt` effect (rule 613.4d): a layer-7d `PtModifier.switchPt`,
 * applied after every other P/T effect and counter — so a pump or a counter
 * that arrives after the switch still lands on power first and is then
 * switched — undone by a second switch, and gone at end of turn.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, nextTurn, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("switch power and toughness", () => {
  it("Twisted Image switches a creature until end of turn", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    const before = pt(game, wall);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Twisted Image"), { targets: [ref(wall)] });
    // A 0/8 becomes an 8/0 and dies to state-based actions (rule 704.5f).
    expect(before).toEqual({ power: 0, toughness: 8 });
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("applies after a later pump and a counter (rule 613.4d), and ends with the turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Twisted Image"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    // 2/2 +3/+3 = 5/5, switched: still 5/5. A +1/+1 counter: 6/6.
    game.state.objects[bears].counters["+1/+1"] = 1;
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    delete game.state.objects[bears].counters["+1/+1"];
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("a second switch undoes the first; Mannichi switches every creature", () => {
    const { game } = table();
    const mannichi = spawn(game, "Mannichi, the Fevered Dream", A);
    const giant = spawn(game, "Hill Giant", B);
    const spider = spawn(game, "Giant Spider", B);
    lands(game, "Mountain", 4);
    activate(game, mannichi);
    expect(pt(game, spider)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, mannichi)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    activate(game, mannichi);
    expect(pt(game, spider)).toEqual({ power: 2, toughness: 4 });
  });

  it("switches a creature whose power and toughness differ through a pump", () => {
    const { game } = table();
    const spider = spawn(game, "Giant Spider", A);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Twisted Image"), { targets: [ref(spider)] });
    expect(pt(game, spider)).toEqual({ power: 4, toughness: 2 });
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(spider)] });
    // 2/4 +3/+3 = 5/7, then the switch: 7/5.
    expect(pt(game, spider)).toEqual({ power: 7, toughness: 5 });
  });
});
