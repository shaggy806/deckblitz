/**
 * "Draw X cards. For each card drawn this way, discard a card unless you
 * sacrifice a permanent." (Read the Runes — need key
 * effect:discard-unless-sacrifice-per-card): the draw, then one choice of
 * up to that many permanents to sacrifice (`choose-permanents` over
 * `thisWay: "drawn"`), then a discard of the cards drawn that no sacrifice
 * answered (`difference` of `drawn` and `sacrificed`) — its ruling's order.
 */

import { describe, expect, it } from "vitest";

import { cast, graveyard, hand, lands, pickPermanents, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Read the Runes", () => {
  it("draws X, sacrifices the permanents chosen, and discards one card for each other card drawn", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Plains");
    const runes = toHand(game, "Read the Runes");
    toHand(game, "Shock");
    let asked: { min: number; max: number } | undefined;
    a.choosePermanentsFn = (_view, _eligible, min, max) => {
      asked = { min, max };
      return [bears];
    };
    const before = hand(game).length - 1;
    cast(game, runes, { x: 3 });
    // Up to one permanent for each of the three cards drawn, none required.
    expect(asked).toEqual({ min: 0, max: 3 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    // Three drawn, one answered by the sacrifice: two discarded.
    expect(hand(game).length).toBe(before + 3 - 2);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName !== "Grizzly Bears").length).toBe(3);
    expect(islands.every((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("never forces a sacrifice: none chosen discards one card for each card drawn", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 2; i += 1) toLibrary(game, "Plains");
    const runes = toHand(game, "Read the Runes");
    toHand(game, "Shock");
    pickPermanents(a);
    const before = hand(game).length - 1;
    cast(game, runes, { x: 2 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 2 - 2);
  });

  it("sacrifices as many as were drawn, discarding nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    toLibrary(game, "Plains");
    const runes = toHand(game, "Read the Runes");
    // Two picked where one card was drawn: only the first is taken.
    a.choosePermanentsFn = (_view, _eligible, _min, max) => [bears, elves].slice(0, max);
    const before = hand(game).length - 1;
    cast(game, runes, { x: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });
});
