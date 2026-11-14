/**
 * An "enters with X counters" whose X counts cards in hands counts the card
 * itself when it's put onto the battlefield straight from a hand (rule 614.12:
 * the replacement applies before it moves, while it's still there) — Realm
 * Seekers' ruling. Cast, it's on the stack as it resolves, and isn't counted.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, counters, hand, lands, ref, settle, table, toHand } from "./harness.js";

describe("Realm Seekers counts the hands as it enters", () => {
  it("cast, it counts every other card in every hand", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    toHand(game, "Grizzly Bears", B);
    const seekers = toHand(game, "Realm Seekers");
    const others = hand(game, A).length - 1 + hand(game, B).length;
    cast(game, seekers);
    expect(counters(game, seekers)).toBe(others);
  });

  it("put onto the battlefield from a hand, it counts itself", () => {
    const { game } = table();
    toHand(game, "Grizzly Bears", B);
    const seekers = toHand(game, "Realm Seekers");
    const all = hand(game, A).length + hand(game, B).length;
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(seekers)]);
    settle(game);
    expect(counters(game, seekers)).toBe(all);
  });

  it("a counter pays for a land search", () => {
    const { game, a } = table({ deck: "Forest" });
    lands(game, "Forest", 9);
    const seekers = toHand(game, "Realm Seekers");
    cast(game, seekers);
    const had = counters(game, seekers);
    const handBefore = hand(game, A).length;
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    game.dispatch({ type: "activate-ability", player: A, source: seekers, abilityIndex: 0, targets: [] });
    settle(game);
    expect(counters(game, seekers)).toBe(had - 1);
    expect(hand(game, A).length).toBe(handBefore + 1);
  });
});
