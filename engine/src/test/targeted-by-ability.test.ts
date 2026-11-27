/**
 * `CardFilter.targetedByAbility` — it is the target of an ability on the
 * stack from a source of a kind (rules 115.1c, 115.1d), `otherThanSource` leaving out
 * the filter's own permanent: Goblin Artisans' "artifact spell you control
 * that isn't the target of an ability from another creature named Goblin
 * Artisans".
 */

import { describe, expect, it } from "vitest";

import { A, activate, cast, hand, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Goblin Artisans", () => {
  it("draws on a won flip, counters its own artifact spell on a lost one (its own ability doesn't count)", () => {
    const outcomes = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game } = table({ seed });
      const artisans = spawn(game, "Goblin Artisans");
      const thopter = toHand(game, "Ornithopter");
      cast(game, thopter, { settle: false });
      const cards = hand(game).length;
      activate(game, artisans, 0, { targets: [ref(thopter)] });
      if (zone(game, thopter) === "battlefield") {
        expect(hand(game).length).toBe(cards + 1);
        outcomes.add("won");
      } else {
        expect(zone(game, thopter)).toBe("graveyard");
        expect(hand(game).length).toBe(cards);
        outcomes.add("lost");
      }
    }
    expect([...outcomes].sort()).toEqual(["lost", "won"]);
  });

  it("another Goblin Artisans can't target a spell one is already aiming at", () => {
    const { game } = table();
    const first = spawn(game, "Goblin Artisans");
    const second = spawn(game, "Goblin Artisans");
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter, { settle: false });
    activate(game, first, 0, { targets: [ref(thopter)], settle: false });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: second, abilityIndex: 0, targets: [ref(thopter)] }),
    ).not.toBeNull();
    settle(game);
    expect(game.state.objects[second].tapped).toBe(false);
  });

  it("only an artifact spell you control", () => {
    const { game } = table();
    const artisans = spawn(game, "Goblin Artisans");
    const bears = toHand(game, "Grizzly Bears");
    spawn(game, "Forest");
    spawn(game, "Forest");
    cast(game, bears, { settle: false });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: artisans, abilityIndex: 0, targets: [ref(bears)] }),
    ).not.toBeNull();
  });
});
