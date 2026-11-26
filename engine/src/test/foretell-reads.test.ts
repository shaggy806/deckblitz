/**
 * Niko Defies Destiny's three reads of foretell: `{ countInExile }`, an amount
 * over the cards in exile ("for each foretold card you own in exile", rule
 * 702.143c-d); mana spent only to foretell (702.143a, the `"foretell"`
 * purpose) or on a spell with foretell (`hasKeyword: "foretell"`, printed,
 * cast from anywhere — the ruling); and "target card with foretell" in a
 * graveyard.
 */

import { describe, expect, it } from "vitest";

import { A, cast, enter, hand, lands, life, settle, table, toExile, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("Niko Defies Destiny", () => {
  it("I: gains 2 life for each foretold card its controller owns in exile, no other exiled card", () => {
    const { game } = table();
    lands(game, "Island", 4);
    for (const card of [toHand(game, "Behold the Multiverse"), toHand(game, "Behold the Multiverse")]) {
      game.dispatch({ type: "foretell", player: A, card });
    }
    toExile(game, "Grizzly Bears");
    toExile(game, "Behold the Multiverse");
    const before = life(game);
    enter(game, "Niko Defies Destiny");
    expect(life(game)).toBe(before + 4);
  });

  it("II: its {W}{U} casts a spell with foretell, from the hand, but not one without", () => {
    const { game } = table();
    enter(game, "Niko Defies Destiny");
    toStep(game, "precombat-main", A);
    settle(game);
    expect(game.state.players[A].manaPool.length).toBe(2);
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    expect(() => cast(game, divination, { settle: false })).toThrow(/cannot pay/);
    lands(game, "Island", 1);
    const behold = toHand(game, "Behold the Multiverse");
    cast(game, behold);
    expect(zone(game, behold)).toBe("graveyard");
    expect(game.state.players[A].manaPool.length).toBe(0);
  });

  it("II: its mana pays to foretell a card", () => {
    const { game } = table();
    enter(game, "Niko Defies Destiny");
    toStep(game, "precombat-main", A);
    settle(game);
    const behold = toHand(game, "Behold the Multiverse");
    game.dispatch({ type: "foretell", player: A, card: behold });
    expect(game.state.objects[behold].foretold).toBe(true);
    expect(game.state.players[A].manaPool.length).toBe(0);
  });

  it("III: returns a card with foretell from the graveyard, and offers no card without", () => {
    const { game, a } = table();
    const behold = toGraveyard(game, "Behold the Multiverse");
    const divination = toGraveyard(game, "Divination");
    enter(game, "Niko Defies Destiny");
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, options) => {
      offered = options[0] ?? [];
      return [options[0]?.find((t) => t.kind === "object" && t.object === behold) ?? null];
    };
    toStep(game, "precombat-main", A);
    settle(game);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(zone(game, behold)).toBe("hand");
    expect(hand(game)).toContain(behold);
    expect(offered.some((t) => (t as { object?: unknown }).object === divination)).toBe(false);
    expect(zone(game, divination)).toBe("graveyard");
  });
});
