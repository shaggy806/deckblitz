/**
 * Lazav, Familiar Stranger: a crime puts a counter on it, then it may exile a
 * card from a graveyard — not linked to it (rule 607.2a) — and become a copy
 * of a creature card exiled this way until end of turn. Once each turn.
 */

import { describe, expect, it } from "vitest";
import { nameOf } from "../state.js";
import { B, cast, counters, destroy, lands, nextTurn, pickFromZone, pickModes, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

function crime(game: ReturnType<typeof table>["game"]): void {
  cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
}

describe("Lazav, Familiar Stranger", () => {
  it("a crime: a counter, a creature card exiled from a graveyard, and Lazav a copy of it until end of turn", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Familiar Stranger");
    const giant = toGraveyard(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    const seen = pickFromZone(a, giant);
    pickModes(a, 0);
    crime(game);
    expect(seen.offered).toContain(giant);
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, lazav)).toBe(1);
    expect(nameOf(game.state.objects[lazav])).toBe("Hill Giant");
    // Hill Giant's 3/3 and Lazav's counter.
    expect(pt(game, lazav)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(nameOf(game.state.objects[lazav])).toBe("Lazav, Familiar Stranger");
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 5 });
  });

  it("a card that isn't a creature card is exiled, and nothing is asked about a copy", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Familiar Stranger");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Mountain", 2);
    pickFromZone(a, bolt);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    crime(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(asked).toBe(0);
    expect(nameOf(game.state.objects[lazav])).toBe("Lazav, Familiar Stranger");
  });

  it("may exile nothing, and may decline the copy", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Familiar Stranger");
    const giant = toGraveyard(game, "Hill Giant", B);
    lands(game, "Mountain", 4);
    pickFromZone(a);
    crime(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, lazav)).toBe(1);
  });

  it("the exiled card isn't linked: as a copy of Fiend Hunter leaving, nothing comes back", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Familiar Stranger");
    const hunter = toGraveyard(game, "Fiend Hunter", B);
    lands(game, "Mountain", 2);
    pickFromZone(a, hunter);
    pickModes(a, 0);
    crime(game);
    expect(nameOf(game.state.objects[lazav])).toBe("Fiend Hunter");
    destroy(game, lazav);
    expect(zone(game, hunter)).toBe("exile");
  });

  it("triggers only once each turn", () => {
    const { game, a } = table();
    const lazav = spawn(game, "Lazav, Familiar Stranger");
    lands(game, "Mountain", 2);
    pickFromZone(a);
    crime(game);
    crime(game);
    expect(counters(game, lazav)).toBe(1);
  });
});
