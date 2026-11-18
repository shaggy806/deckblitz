/**
 * A token shuffled into a library sits there until the next state-based check
 * (rule 704.5d), but it isn't a card (rule 111.1): a `reveal-until` or a
 * `reveal-until-count` in the same resolution passes over it. One that
 * exiled as it went used to hang on it — a token can't move from a library,
 * so it stayed on top forever — and one that only revealed could find it.
 */

import { describe, expect, it } from "vitest";

import { A, named, ref, settle, spawn, table } from "./harness.js";

describe("a reveal passes over a token in the library", () => {
  for (const kind of ["reveal-until", "reveal-until-count"] as const) {
    it(`${kind}, exiling: every card exiled, the token never`, () => {
      const { game } = table();
      const bears = spawn(game, "Grizzly Bears");
      game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(bears)]);
      settle(game);
      const token = named(game, "Grizzly Bears").find((id) => game.state.objects[id].isToken === true);
      expect(token).toBeDefined();
      const cards = game.state.zones.perPlayer[A].library.length;
      // Nothing in the all-Wastes library is a creature card; the token is.
      const reveal =
        kind === "reveal-until"
          ? ({ kind, filter: { type: "creature" }, exile: true, rest: "stay" } as const)
          : ({ kind, filter: { type: "creature" }, count: 1, exile: true, rest: "stay" } as const);
      game.debugApplyEffect(A, { kind: "sequence", effects: [{ kind: "shuffle-into-library", target: 0 }, reveal] }, [ref(token!)]);
      settle(game);
      expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id].isToken !== true)).toHaveLength(cards);
      // Only the token is left there, until the next state-based check.
      expect(game.state.zones.perPlayer[A].library).toEqual([token]);
    });
  }

  it("reveal-until, revealing: the token isn't found, so every card is the rest", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(bears)]);
    settle(game);
    const token = named(game, "Grizzly Bears").find((id) => game.state.objects[id].isToken === true);
    const cards = game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        effects: [
          { kind: "shuffle-into-library", target: 0 },
          { kind: "reveal-until", filter: { name: "Grizzly Bears" }, put: "hand", rest: "graveyard" },
        ],
      },
      [ref(token!)],
    );
    settle(game);
    expect(game.state.zones.perPlayer[A].graveyard).toHaveLength(cards);
    expect(game.state.zones.perPlayer[A].hand.includes(token!)).toBe(false);
  });
});
