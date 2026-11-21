/**
 * Sasaya, Orochi Ascendant // Sasaya's Essence: a "Reveal your hand" cost
 * (`AbilityCost.revealHand`, rule 701.20a) with a filtered hand count, and a
 * triggered mana ability whose amount reads the tapped land as "it" — "for
 * each other land you control with the same name as it" — each extra unit
 * its own pick of the types that land made (gaps keys
 * `effect:mana-produced-per-same-name-land`, `condition:hand-land-card-count`).
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import { printedCardName } from "../state.js";
import { A, B, activate, hand, lands, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId } from "../primitives.js";

const pool = (game: Game) => poolCounts(game.state.players[A].manaPool);
const tap = (game: Game, source: ObjectId, manaColors?: readonly ManaType[]): void =>
  void game.dispatch({
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: 0,
    targets: [],
    ...(manaColors !== undefined ? { manaColors } : {}),
  });

describe("Sasaya, Orochi Ascendant", () => {
  it("reveals the hand and flips with seven land cards in it", () => {
    const { game } = table();
    const sasaya = spawn(game, "Sasaya, Orochi Ascendant");
    game.state.zones.perPlayer[A].hand.splice(0);
    for (let i = 0; i < 7; i += 1) toHand(game, "Forest");
    const bolt = toHand(game, "Lightning Bolt");
    activate(game, sasaya);
    expect(game.state.revealedThisTurn).toEqual(expect.arrayContaining([...hand(game)]));
    expect(game.state.revealedThisTurn).toContain(bolt);
    expect(printedCardName(game.state.objects[sasaya])).toBe("Sasaya's Essence");
  });

  it("can be activated with fewer, and then does nothing — nonland cards don't count", () => {
    const { game } = table();
    const sasaya = spawn(game, "Sasaya, Orochi Ascendant");
    game.state.zones.perPlayer[A].hand.splice(0);
    for (let i = 0; i < 6; i += 1) toHand(game, "Forest");
    toHand(game, "Lightning Bolt");
    toHand(game, "Llanowar Elves");
    activate(game, sasaya);
    expect(printedCardName(game.state.objects[sasaya])).toBe("Sasaya, Orochi Ascendant");
  });
});

/** Sasaya, flipped the way it says: seven lands revealed, then the hand emptied. */
const essence = (game: Game): ObjectId => {
  const sasaya = spawn(game, "Sasaya, Orochi Ascendant");
  game.state.zones.perPlayer[A].hand.splice(0);
  for (let i = 0; i < 7; i += 1) toHand(game, "Forest");
  activate(game, sasaya);
  expect(printedCardName(game.state.objects[sasaya])).toBe("Sasaya's Essence");
  game.state.zones.perPlayer[A].hand.splice(0);
  return sasaya;
};

describe("Sasaya's Essence", () => {
  it("adds one more of the type for each other land with the land's name", () => {
    const { game } = table();
    essence(game);
    const [forest] = lands(game, "Forest", 4);
    lands(game, "Mountain", 2);
    tap(game, forest);
    // Four Forests: {G} and three more (the ruling).
    expect(pool(game)).toMatchObject({ G: 4 });
    expect(pool(game).R ?? 0).toBe(0);
  });

  it("adds nothing off a land with no namesake, and counts only your own", () => {
    const { game } = table();
    essence(game);
    const [forest] = lands(game, "Forest", 1);
    lands(game, "Forest", 2, B);
    tap(game, forest);
    expect(pool(game)).toMatchObject({ G: 1 });
  });

  it("lets each extra unit off a two-type land be either type it made", () => {
    const { game } = table();
    essence(game);
    const chanceries = lands(game, "Azorius Chancery", 3);
    for (const id of chanceries) game.state.objects[id].tapped = false;
    const valley = chanceries[0];
    // Chancery makes {W}{U}: two more, each {W} or {U}.
    tap(game, valley, ["W", "U"]);
    expect(pool(game)).toMatchObject({ W: 2, U: 2 });
  });

  it("is counted by the auto-payer", () => {
    const { game } = table();
    essence(game);
    lands(game, "Forest", 3);
    const forests = game.state.zones.shared.battlefield.filter((id) => printedCardName(game.state.objects[id]) === "Forest");
    for (const id of forests.slice(1)) game.state.objects[id].tapped = true;
    // One untapped Forest of three: {G}{G}{G} for a three-drop.
    const card = toHand(game, "Centaur Courser");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    expect(game.state.objects[card].zone).toBe("stack");
  });
});
