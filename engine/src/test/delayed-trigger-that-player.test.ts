/**
 * A delayed triggered ability acting for "that player" of the trigger that
 * set it up (Horn of Plenty: "Whenever a player casts a spell, they may pay
 * {1}. If the player does, they draw a card at the beginning of the next end
 * step"): the caster is asked, pays, and draws at the end step, though the
 * delayed ability is the Horn's controller's (rule 603.7e).
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, enter, hand, lands, nextTurn, settle, table, toHand, toStep } from "./harness.js";

describe("Horn of Plenty", () => {
  it("an opponent who casts a spell and pays {1} draws at the next end step", () => {
    const { game, b } = table();
    enter(game, "Horn of Plenty");
    nextTurn(game);
    expect(game.state.priority.holder).toBe(B);
    lands(game, "Forest", 3, B);
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    const bHand = hand(game, B).length;
    const aHand = hand(game, A).length;
    // Paid, but nothing drawn yet: it waits for the end step.
    expect(game.state.players[B].manaPool.length).toBe(0);
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B).length).toBe(bHand + 1);
    expect(hand(game, A).length).toBe(aHand);
  });

  it("declined, nobody draws", () => {
    const { game, b } = table();
    enter(game, "Horn of Plenty");
    nextTurn(game);
    lands(game, "Forest", 3, B);
    b.chooseModesFn = () => [];
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    const bHand = hand(game, B).length;
    const aHand = hand(game, A).length;
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B).length).toBe(bHand);
    expect(hand(game, A).length).toBe(aHand);
  });

  it("its controller's own spell: they pay and draw", () => {
    const { game, a } = table();
    enter(game, "Horn of Plenty");
    lands(game, "Forest", 3);
    a.chooseModesFn = () => [0];
    cast(game, toHand(game, "Grizzly Bears"));
    const aHand = hand(game, A).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game, A).length).toBe(aHand + 1);
  });

  it("can't pay with nothing left: no draw", () => {
    const { game, b } = table();
    enter(game, "Horn of Plenty");
    nextTurn(game);
    lands(game, "Forest", 2, B);
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    const bHand = hand(game, B).length;
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B).length).toBe(bHand);
  });
});
