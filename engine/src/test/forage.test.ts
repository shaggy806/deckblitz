/**
 * Forage (rule 701.61a): "exile three cards from your graveyard or sacrifice
 * a Food" — offered only when one of them can be done (the rulings), and
 * "whenever you forage" sees either way.
 */
import { describe, expect, it } from "vitest";

import { A, counters, enter, graveyard, hand, pickFromZone, pickModes, spawn, table, toGraveyard, zone } from "./harness.js";

describe("forage", () => {
  it("Treetop Sentries exiles three cards from your graveyard to draw", () => {
    const { game, a } = table();
    const cards = ["Grizzly Bears", "Hill Giant", "Craw Wurm"].map((name) => toGraveyard(game, name));
    pickModes(a, 0);
    pickFromZone(a, ...cards);
    const before = hand(game, A).length;
    enter(game, "Treetop Sentries");
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("or sacrifices a Food", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
    const food = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Food Token")!;
    pickModes(a, 0); // the Food: the graveyard way isn't offered with too few cards
    const before = hand(game, A).length;
    enter(game, "Treetop Sentries");
    expect(game.state.objects[food]?.zone ?? "gone").not.toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("can't forage with neither: no draw", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const before = hand(game, A).length;
    enter(game, "Treetop Sentries");
    expect(hand(game, A).length).toBe(before);
    expect(graveyard(game, A)).toHaveLength(1);
  });

  it("Corpseberry Cultivator: whenever you forage — another card's forage too", () => {
    const { game, a } = table();
    const cultivator = spawn(game, "Corpseberry Cultivator");
    const cards = ["Grizzly Bears", "Hill Giant", "Craw Wurm"].map((name) => toGraveyard(game, name));
    pickModes(a, 0);
    pickFromZone(a, ...cards);
    enter(game, "Treetop Sentries");
    expect(counters(game, cultivator)).toBe(1);
  });
});
