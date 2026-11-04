// Mistrise Village: "{U}, {T}: The next spell you cast this turn can't be
// countered." `grant-spells-this-turn`'s `next` (Overmaster, Insist) with no
// filter: the next spell of any kind.

import { describe, expect, it } from "vitest";

import { spellCantBeCountered } from "../characteristics.js";
import { poolCounts } from "../mana.js";
import { A, activate, B, cast, enter, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Alice with the Village's second ability resolved, an Island having paid. */
function grantedTable() {
  const t = table();
  const { game } = t;
  lands(game, "Island", 6);
  lands(game, "Mountain", 1);
  const village = spawn(game, "Mistrise Village");
  activate(game, village, 1);
  settle(game);
  expect(game.state.objects[village].tapped).toBe(true);
  return t;
}

describe("Mistrise Village", () => {
  it("enters tapped with neither a Mountain nor a Forest, untapped beside either", () => {
    const none = table().game;
    lands(none, "Island", 1);
    expect(none.state.objects[enter(none, "Mistrise Village")].tapped).toBe(true);
    const mountain = table().game;
    lands(mountain, "Mountain", 1);
    expect(mountain.state.objects[enter(mountain, "Mistrise Village")].tapped).toBe(false);
    const forest = table().game;
    lands(forest, "Forest", 1);
    expect(forest.state.objects[enter(forest, "Mistrise Village")].tapped).toBe(false);
  });

  it("taps for {U}", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    activate(game, spawn(game, "Mistrise Village"), 0);
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ U: 1 });
  });

  it("needs {U} for its second ability", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    expect(() => activate(game, spawn(game, "Mistrise Village"), 1)).toThrow();
  });

  it("the next spell of any kind can't be countered, and only that one", () => {
    const { game } = grantedTable();
    const first = toHand(game, "Divination");
    cast(game, first, { settle: false });
    expect(spellCantBeCountered(game.state, game.registry, game.state.objects[first])).toBe(true);
    settle(game);
    const second = toHand(game, "Divination");
    cast(game, second, { settle: false });
    expect(spellCantBeCountered(game.state, game.registry, game.state.objects[second])).toBe(false);
  });

  it("stands up to a Counterspell", () => {
    const { game } = grantedTable();
    lands(game, "Island", 2, B);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, bears, { settle: false });
    const counter = toHand(game, "Counterspell", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, counter, { player: B, targets: [ref(bears)], settle: false });
    settle(game);
    expect(zone(game, counter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("only this turn", () => {
    const { game } = grantedTable();
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const spell = toHand(game, "Divination");
    cast(game, spell, { settle: false });
    expect(spellCantBeCountered(game.state, game.registry, game.state.objects[spell])).toBe(false);
  });
});
