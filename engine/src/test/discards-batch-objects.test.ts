/**
 * "Whenever you discard one or more cards, exile **them** from your
 * graveyard" (Toluz, Clever Conductor): a `discards` trigger's batch
 * (`"trigger-batch"`) read by `exile-graveyard`'s filter, the cards exiled
 * linked to the source (rule 607.2a), and "the cards exiled with it" put into
 * their owner's hand as it dies.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, enter, graveyard, hand, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Toluz, Clever Conductor", () => {
  it("connives as it enters, and the card it discards is exiled with it", () => {
    const { game, a } = table();
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    const toluz = enter(game, "Toluz, Clever Conductor");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    // A nonland card discarded: the connive counter.
    expect(game.state.objects[toluz].counters["+1/+1"]).toBe(1);
  });

  it("exiles every card of a discard, only those, and puts them into hand as it dies", () => {
    const { game, a } = table();
    const toluz = spawn(game, "Toluz, Clever Conductor");
    const old = spawn(game, "Grizzly Bears");
    destroy(game, old);
    expect(zone(game, old)).toBe("graveyard");
    const one = toHand(game, "Hill Giant");
    const two = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [one, two];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 });
    settle(game);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    // A card already in the graveyard isn't one of them.
    expect(graveyard(game)).toContain(old);
    destroy(game, toluz);
    settle(game);
    expect(zone(game, toluz)).toBe("graveyard");
    expect(hand(game)).toContain(one);
    expect(hand(game)).toContain(two);
  });

  it("an opponent's discard isn't yours", () => {
    const { game, b } = table();
    spawn(game, "Toluz, Clever Conductor");
    const theirs = toHand(game, "Hill Giant", B);
    b.chooseDiscardsFn = () => [theirs];
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
