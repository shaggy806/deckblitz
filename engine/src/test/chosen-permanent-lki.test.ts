/**
 * A permanent chosen as an effect resolves (`choose-permanents`) is read as it last existed on the
 * battlefield once its `then` has moved it (rule 608.2h): "you may return another creature you
 * control to its owner's hand, then put +1/+1 counters equal to its power on this" counts the
 * counters the returned creature had, not the card's printed power in hand.
 */
import { describe, expect, it } from "vitest";

import { A, counters, pickPermanents, ref, settle, spawn, table, zone } from "./harness.js";

describe("a chosen permanent that its `then` moves is read as it last existed (608.2h)", () => {
  it("reads the returned creature's power with its counters", () => {
    const { game, a } = table();
    const holder = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant"); // 3/3
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    pickPermanents(a, giant);
    game.debugApplyEffect(
      A,
      {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        upTo: 1,
        exceptSource: true,
        prompt: "Return another creature you control?",
        then: {
          kind: "sequence",
          effects: [
            { kind: "return-to-hand", target: 0 },
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: { powerOf: 0 } },
          ],
        },
      },
      [],
      { source: holder },
    );
    settle(game);
    expect(zone(game, giant)).toBe("hand");
    expect(counters(game, holder)).toBe(4);
  });
});
