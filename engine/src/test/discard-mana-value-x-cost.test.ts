/**
 * "Discard a card with mana value X" — `cost.discard.manaValueX` (Kozilek, the
 * Great Distortion; Knollspine Invocation). X is announced as the ability's
 * activated (rule 107.3a), with no {X} needed in the mana cost; the ability's
 * offered once per X with a card to pay it (and, Kozilek's, a spell to target).
 * `table` deals no opening hand here, but alice has the turn's draw: a Wastes,
 * mana value 0.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, graveyard, hand, lands, life, settle, spawn, table, toHand, zone } from "./harness.js";

type G = ReturnType<typeof table>["game"];
const offeredXs = (game: G, name: string): (number | undefined)[] =>
  game
    .legalActions(A)
    .flatMap((la) => (la.kind === "activate-ability" && la.cardName === name ? [la.xCost?.maxX] : []))
    .sort();

describe("a discard cost of mana value X", () => {
  it("Kozilek counters a spell whose mana value matches the card discarded, and only that card pays", () => {
    const { game } = table({ openingHandSize: 0 });
    const kozilek = spawn(game, "Kozilek, the Great Distortion", A);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    const matching = toHand(game, "Runeclaw Bear");
    const angel = toHand(game, "Serra Angel");
    cast(game, bears, { settle: false });
    // A spell of mana value 2 on the stack, cards of mana value 0, 2 and 5 in
    // hand: only X = 2 has both.
    expect(offeredXs(game, "Kozilek, the Great Distortion")).toEqual([2]);
    const on = [{ kind: "object" as const, object: bears }];
    expect(game.canDispatch({ type: "activate-ability", player: A, source: kozilek, abilityIndex: 0, targets: on, xValue: 5 })).not.toBeNull();
    activate(game, kozilek, 0, { targets: on, x: 2 });
    expect(zone(game, matching)).toBe("graveyard");
    expect(zone(game, angel)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, kozilek)).toBe("battlefield");
  });

  it("offers nothing with an empty stack, or no card in hand of a spell's mana value", () => {
    const { game } = table({ openingHandSize: 0 });
    spawn(game, "Kozilek, the Great Distortion", A);
    toHand(game, "Serra Angel");
    expect(offeredXs(game, "Kozilek, the Great Distortion")).toEqual([]);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    expect(offeredXs(game, "Kozilek, the Great Distortion")).toEqual([]);
  });

  it("X = 0 discards a mana-value-0 card for a mana-value-0 spell, and asks which", () => {
    const { game } = table({ openingHandSize: 0 });
    const kozilek = spawn(game, "Kozilek, the Great Distortion", A);
    const land = toHand(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    const ornithopter = toHand(game, "Ornithopter");
    cast(game, ornithopter, { settle: false });
    expect(offeredXs(game, "Kozilek, the Great Distortion")).toEqual([0]);
    activate(game, kozilek, 0, { targets: [{ kind: "object", object: ornithopter }], x: 0, settle: false });
    // The drawn Wastes and the Forest may pay; the Grizzly Bears can't.
    expect(game.state.awaiting?.kind).toBe("discard");
    expect(game.canDispatch({ type: "discard", player: A, cards: [bears] })).not.toBeNull();
    game.dispatch({ type: "discard", player: A, cards: [land] });
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ornithopter)).toBe("graveyard");
  });

  it("Kozilek's cast trigger draws up to seven", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Wastes", 10);
    const kozilek = toHand(game, "Kozilek, the Great Distortion");
    toHand(game, "Forest");
    toHand(game, "Forest");
    const library = game.state.zones.perPlayer[A].library.length;
    cast(game, kozilek);
    // Three in hand as it's cast: four more.
    expect(hand(game).length).toBe(7);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 4);
    expect(zone(game, kozilek)).toBe("battlefield");
  });

  it("Kozilek's cast trigger doesn't fire with seven cards left in hand", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Wastes", 10);
    const kozilek = toHand(game, "Kozilek, the Great Distortion");
    for (let i = 0; i < 6; i += 1) toHand(game, "Forest");
    const library = game.state.zones.perPlayer[A].library.length;
    cast(game, kozilek);
    expect(hand(game).length).toBe(7);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library);
  });

  it("Knollspine Invocation pays X in mana and a card of that mana value, and deals X", () => {
    const { game } = table({ openingHandSize: 0 });
    const invocation = spawn(game, "Knollspine Invocation", A);
    lands(game, "Mountain", 3);
    const angel = toHand(game, "Serra Angel"); // 5, more than the mana
    const bears = toHand(game, "Grizzly Bears"); // 2
    // The drawn Wastes is 0; no card of 1 or 3, and {5} can't be paid.
    expect(offeredXs(game, "Knollspine Invocation")).toEqual([0, 2]);
    activate(game, invocation, 0, { targets: [{ kind: "player", player: B }], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("hand");
    expect(life(game, B)).toBe(18);
    expect(graveyard(game)).toContain(bears);
  });
});
