/**
 * "Each opponent who voted for a choice you didn't vote for" (Grudge Keeper —
 * rule 701.38): the `"opponents-who-voted-otherwise"` scope, read off the vote
 * that fired "whenever players finish voting". Written from the card's Oracle
 * text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, C, cast, lands, life, pickModes, spawn, table, toHand } from "./harness.js";

/** Two of each basic land for alice: enough for any spell here. */
function mana(game: Game): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, 2);
}

describe("Grudge Keeper", () => {
  it("the opponent who voted otherwise loses 2 life; the one who voted with alice doesn't", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Grudge Keeper", A);
    pickModes(a, 0);
    pickModes(b, 0);
    pickModes(c, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(18);
  });

  it("only its controller's opponents: bob's Keeper takes 2 from alice, not from bob himself", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Grudge Keeper", B);
    pickModes(a, 1);
    pickModes(b, 0);
    pickModes(c, 0);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(20);
  });

  it("an opponent with two votes for a choice alice didn't vote for loses 2 life once", () => {
    const { game, a, b } = table();
    spawn(game, "Grudge Keeper", A);
    spawn(game, "Brago's Representative", B);
    pickModes(a, 0);
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(life(game, B)).toBe(18);
  });

  it("alice voting for both choices: an opponent voted for one of hers, and loses nothing", () => {
    const { game, a, b } = table();
    spawn(game, "Grudge Keeper", A);
    spawn(game, "Brago's Representative", A);
    let asked = 0;
    a.chooseModesFn = () => [asked++ === 0 ? 0 : 1];
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(asked).toBe(2);
    expect(life(game, B)).toBe(20);
  });

  it("each opponent's vote is read once per vote: two Keepers, 4 life", () => {
    const { game, a, b } = table();
    spawn(game, "Grudge Keeper", A);
    spawn(game, "Grudge Keeper", A);
    pickModes(a, 0);
    pickModes(b, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(life(game, B)).toBe(16);
  });

  it("triggers even when the vote's result exiles it (the ruling)", () => {
    const { game, a, b, c } = table({ players: 3 });
    // Council's Judgment: each player votes for a nonland permanent alice
    // doesn't control. Bob's Keeper gets two votes and is exiled.
    const keeper = spawn(game, "Grudge Keeper", B);
    const bears = spawn(game, "Grizzly Bears", C);
    a.choosePermanentsFn = () => [keeper];
    b.choosePermanentsFn = () => [keeper];
    c.choosePermanentsFn = () => [bears];
    mana(game);
    cast(game, toHand(game, "Council's Judgment"));
    expect(game.state.objects[keeper].zone).toBe("exile");
    expect(game.state.objects[bears].zone).toBe("battlefield");
    // Carol voted for a choice bob didn't; alice voted with him.
    expect(life(game, A)).toBe(20);
    expect(life(game, C)).toBe(18);
  });
});
