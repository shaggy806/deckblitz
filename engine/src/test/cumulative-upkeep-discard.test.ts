/**
 * Cumulative upkeep—Discard a card (rule 702.24a — `cumulativeUpkeep({
 * doing: { kind: "discard", … } })`): a card discarded for each age counter,
 * all of them or none, so it can't be paid with fewer cards in hand than age
 * counters (118.3, `mayBeDone`'s repeated discard). Vexing Sphinx, whose dies
 * trigger then draws a card for each age counter it had.
 */
import { describe, expect, it } from "vitest";
import { A, counters, graveyard, hand, nextTurn, pickModes, settle, spawn, table, toHand, zone } from "./harness.js";

describe("cumulative upkeep paid by discarding", () => {
  it("Vexing Sphinx: a card discarded for each age counter while it's paid", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const sphinx = spawn(game, "Vexing Sphinx");
    for (let i = 0; i < 4; i++) toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    const before = graveyard(game, A).length;
    nextTurn(game);
    expect(counters(game, sphinx, "age")).toBe(1);
    expect(graveyard(game, A).length - before).toBe(1);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, sphinx, "age")).toBe(2);
    expect(graveyard(game, A).length - before).toBe(3);
    expect(zone(game, sphinx)).toBe("battlefield");
  });

  it("Vexing Sphinx: with fewer cards in hand than age counters it can't be paid, so it dies and draws for each", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const sphinx = spawn(game, "Vexing Sphinx");
    toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, sphinx, "age")).toBe(1);
    nextTurn(game);
    // Down to one card before alice's next upkeep.
    const extra = hand(game, A).length - 1;
    if (extra > 0) game.debugApplyEffect(A, { kind: "discard", target: "you", amount: extra }, []);
    settle(game);
    expect(hand(game, A).length).toBe(1);
    // Two age counters and one card: no payment is offered (all or none).
    let asked = 0;
    a.chooseModesFn = () => {
      asked++;
      return [0];
    };
    const handBefore = hand(game, A).length;
    nextTurn(game);
    expect(asked).toBe(0);
    expect(zone(game, sphinx)).toBe("graveyard");
    // Not a card discarded; two drawn for the two age counters, and the turn's draw.
    expect(hand(game, A).length).toBe(handBefore + 3);
    expect(counters(game, sphinx, "age")).toBe(0);
  });
});
