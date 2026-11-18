/**
 * "If that creature shares a color with the mana that land produced" — a
 * `target` condition over `CardFilter.sharesColorWithMana: "produced"`, bound
 * as it resolves to the mana the tapped permanent's ability made (rule
 * 106.12a; `LastKnownRefs.manaProduced`), colorless mana no color (105.2c).
 * C.A.M.P.'s "Whenever fortified land is tapped for mana, put a +1/+1 counter
 * on target creature you control. If that creature shares a color with the
 * mana that land produced, create a Junk token." It targets, so it's no mana
 * ability (605.1b) and goes on the stack.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { matchesFilter } from "../filter.js";
import type { ManaType } from "../mana.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, counters, lands, pickTargets, ref, registryOf, settle, spawn, table, tokensNamed } from "./harness.js";

/** C.A.M.P. fortifying a fresh `land` of alice's. */
function fortified(game: Game, land: string): { camp: ObjectId; land: ObjectId } {
  lands(game, "Wastes", 3);
  const camp = spawn(game, "C.A.M.P.");
  const id = spawn(game, land);
  activate(game, camp, 0, { targets: [ref(id)] });
  expect(game.state.objects[camp].attachedTo).toBe(id);
  return { camp, land: id };
}

/** Tap `land` for mana by hand, by its mana ability that makes `color` (its
 * first one by default). */
function tapFor(game: Game, land: ObjectId, color?: ManaType): void {
  const offers = game
    .legalActions(A)
    .filter((a) => a.kind === "activate-ability" && a.source === land);
  const index =
    color === undefined
      ? 0
      : registryOf(game)
          .get(game.state.objects[land].cardName)
          .activated.findIndex((ability) => ability.effect?.kind === "add-mana" && ability.effect.mana === color);
  expect(offers.length).toBeGreaterThan(0);
  expect(index).toBeGreaterThanOrEqual(0);
  game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: index, targets: [] });
  settle(game);
}

describe("C.A.M.P.", () => {
  it("a counter, and a Junk token when the creature is the mana's color", () => {
    const { game, a } = table();
    const { land } = fortified(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    tapFor(game, land);
    expect(counters(game, bears)).toBe(1);
    expect(tokensNamed(game, "Junk Token", A)).toBe(1);
  });

  it("a counter but no Junk when it isn't", () => {
    const { game, a } = table();
    const { land } = fortified(game, "Forest");
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, lions);
    tapFor(game, land);
    expect(counters(game, lions)).toBe(1);
    expect(tokensNamed(game, "Junk Token", A)).toBe(0);
  });

  it("colorless mana shares no color", () => {
    const { game, a } = table();
    const { land } = fortified(game, "Wastes");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    tapFor(game, land);
    expect(counters(game, bears)).toBe(1);
    expect(tokensNamed(game, "Junk Token", A)).toBe(0);
  });

  it("reads the color the land made this time", () => {
    const { game, a } = table();
    const { land } = fortified(game, "Savannah");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    tapFor(game, land, "W");
    expect(tokensNamed(game, "Junk Token", A)).toBe(0);
    game.state.objects[land].tapped = false;
    tapFor(game, land, "G");
    expect(counters(game, bears)).toBe(2);
    expect(tokensNamed(game, "Junk Token", A)).toBe(1);
  });

  it("unbound, the clause matches nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    expect(matchesFilter(game.state, registryOf(game), bears, { sharesColorWithMana: "produced" }, { you: A })).toBe(false);
  });
});
