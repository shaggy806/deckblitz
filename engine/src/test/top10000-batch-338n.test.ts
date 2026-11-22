/**
 * B338 (decisions lane, agent n): Casting of Bones, Krovikan Sorcerer and
 * Soldevi Sage — "draw N cards, then discard one of them" (need key
 * effect:discard-one-of-drawn): a `discard` whose `filter` is
 * `{ thisWay: "drawn" }`, so only a card the effect drew can be discarded.
 */

import { describe, expect, it } from "vitest";

import { A, activate, cast, destroy, graveyard, hand, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Casting of Bones", () => {
  it("draws three when the enchanted creature dies and discards one of those three, never an older card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const bones = toHand(game, "Casting of Bones");
    const shock = toHand(game, "Shock");
    const drawn = [toLibrary(game, "Plains"), toLibrary(game, "Island"), toLibrary(game, "Forest")];
    cast(game, bones, { targets: [ref(bears)] });
    let offered: readonly string[] = [];
    let count = 0;
    a.chooseDiscardsFn = (cards, n) => {
      offered = cards.map((c) => c.id);
      count = n;
      return [cards[cards.length - 1].id];
    };
    destroy(game, bears);
    expect(count).toBe(1);
    expect([...offered].sort()).toEqual([...drawn].sort());
    expect(zone(game, shock)).toBe("hand");
    expect(drawn.filter((id) => zone(game, id) === "hand").length).toBe(2);
    expect(drawn.filter((id) => zone(game, id) === "graveyard").length).toBe(1);
  });

  it("with an empty library draws nothing and discards nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const bones = toHand(game, "Casting of Bones");
    const shock = toHand(game, "Shock");
    cast(game, bones, { targets: [ref(bears)] });
    game.state.zones.perPlayer[A].library.length = 0;
    destroy(game, bears);
    expect(zone(game, shock)).toBe("hand");
    expect(graveyard(game).some((id) => id === shock)).toBe(false);
  });
});

describe("Soldevi Sage", () => {
  it("sacrifices two lands, draws three and discards one of the cards drawn", () => {
    const { game, a } = table();
    const sage = spawn(game, "Soldevi Sage");
    const [l1, l2] = lands(game, "Island", 2);
    const shock = toHand(game, "Shock");
    const drawn = [toLibrary(game, "Plains"), toLibrary(game, "Island"), toLibrary(game, "Forest")];
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (cards) => {
      offered = cards.map((c) => c.id);
      return [cards[0].id];
    };
    const before = hand(game).length;
    activate(game, sage, 0);
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect([...offered].sort()).toEqual([...drawn].sort());
    expect(zone(game, shock)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Krovikan Sorcerer", () => {
  it("discarding a black card draws two and discards one of them", () => {
    const { game, a } = table();
    const sorcerer = spawn(game, "Krovikan Sorcerer");
    const ritual = toHand(game, "Dark Ritual");
    const shock = toHand(game, "Shock");
    const drawn = [toLibrary(game, "Plains"), toLibrary(game, "Island")];
    const asked: string[][] = [];
    a.chooseDiscardsFn = (cards) => {
      asked.push(cards.map((c) => c.id));
      // The cost: the black card; the effect: the first card offered.
      return [cards.some((c) => c.id === ritual) ? ritual : cards[0].id];
    };
    activate(game, sorcerer, 1);
    expect(zone(game, ritual)).toBe("graveyard");
    expect(zone(game, shock)).toBe("hand");
    expect([...asked[asked.length - 1]].sort()).toEqual([...drawn].sort());
    expect(drawn.filter((id) => zone(game, id) === "hand").length).toBe(1);
  });
});
