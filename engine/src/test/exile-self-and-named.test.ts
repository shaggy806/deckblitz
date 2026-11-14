/**
 * "You may exile this spell and four cards named ~ from your graveyard. If
 * you do, …" (Dragon's Approach): offered only with four others in the
 * graveyard, and taken, the spell goes to exile from the stack rather than
 * to the graveyard (rule 608.2n), the four with it, and the Dragon enters.
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, graveyard, hand, lands, life, pickFromZone, pickModes, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("Dragon's Approach", () => {
  it("with four others in the graveyard, exiles itself and them and fetches a Dragon", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const others = [0, 1, 2, 3, 4].map(() => toGraveyard(game, "Dragon's Approach"));
    const dragon = toLibrary(game, "Shivan Dragon");
    pickModes(a, 0);
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.includes(dragon) ? [dragon] : eligible.slice(0, 4);
    };
    const approach = toHand(game, "Dragon's Approach");
    cast(game, approach);
    expect(life(game, B)).toBe(17);
    expect(zone(game, approach)).toBe("exile");
    expect(others.filter((id) => zone(game, id) === "exile")).toHaveLength(4);
    expect(graveyard(game, A)).toHaveLength(1);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(offered).toContain(dragon);
  });

  it("declined, it goes to the graveyard and nothing is searched", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    [0, 1, 2, 3].forEach(() => toGraveyard(game, "Dragon's Approach"));
    const dragon = toLibrary(game, "Shivan Dragon");
    pickModes(a);
    const approach = toHand(game, "Dragon's Approach");
    cast(game, approach);
    expect(zone(game, approach)).toBe("graveyard");
    expect(zone(game, dragon)).toBe("library");
  });

  it("with only three others, it isn't offered", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    [0, 1, 2].forEach(() => toGraveyard(game, "Dragon's Approach"));
    const dragon = toLibrary(game, "Shivan Dragon");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    pickFromZone(a, dragon);
    const approach = toHand(game, "Dragon's Approach");
    cast(game, approach);
    expect(asked).toBe(false);
    expect(zone(game, approach)).toBe("graveyard");
    expect(zone(game, dragon)).toBe("library");
    expect(life(game, B)).toBe(17);
  });
});

describe("Sphinx's Approach", () => {
  it("draws two, then exiles itself and four others and fetches a Sphinx", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const others = [0, 1, 2, 3].map(() => toGraveyard(game, "Sphinx's Approach"));
    const sphinx = toLibrary(game, "Sphinx of Clear Skies");
    // Two on top of it, for the draw.
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(sphinx) ? [sphinx] : eligible.slice(0, 4));
    const approach = toHand(game, "Sphinx's Approach");
    const handBefore = hand(game, A).length;
    cast(game, approach);
    // The Approach left the hand; the two Islands were drawn.
    expect(hand(game, A).length).toBe(handBefore - 1 + 2);
    expect(zone(game, approach)).toBe("exile");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, sphinx)).toBe("battlefield");
  });
});
