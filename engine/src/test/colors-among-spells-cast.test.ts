/**
 * The `{ colorsAmong }` amount's `andSpellsCastThisTurn`: one set of colours,
 * those among the permanents matching the filter and those of the spells the
 * effect's controller has cast this turn, each as it was cast — First Family's
 * "the number of colors among permanents you control and spells you've cast
 * this turn". The resolving spell is among the spells cast.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("First Family", () => {
  it("counts its own colours: lands are colourless", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "First Family"));
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(22);
  });

  it("adds the permanents' colours and earlier spells' colours, each once", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    spawn(game, "Savannah Lions"); // white
    spawn(game, "Llanowar Elves"); // green again: no more
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] }); // red, gone to the graveyard
    const before = hand(game).length;
    cast(game, toHand(game, "First Family"));
    // White, red, green, blue.
    expect(hand(game).length).toBe(before + 4);
    expect(life(game)).toBe(24);
  });

  it("doesn't count another player's spells, or last turn's", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] }); // alice's red, this turn
    nextTurn(game); // bob's turn
    lands(game, "Mountain", 1, B);
    spawn(game, "Savannah Lions", B); // bob's white permanent
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)] });
    nextTurn(game); // alice's again
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "First Family"));
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(22 - 3);
  });
});
