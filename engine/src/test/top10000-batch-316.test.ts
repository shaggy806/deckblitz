// Batch 316: the top 5000's next ten (EDHREC 3596–3964), each on the feature
// it needed.

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import {
  A,
  B,
  activate,
  destroy,
  life,
  lands,
  ref,
  settle,
  spawn,
  table,
} from "./harness.js";

describe("The Masamune: the equipped creature's death triggers twice", () => {
  const equipped = () => {
    const { game } = table();
    const cutthroat = spawn(game, "Zulaport Cutthroat");
    spawn(game, "Cruel Celebrant");
    const sword = spawn(game, "The Masamune");
    lands(game, "Wastes", 2);
    activate(game, sword, 0, { targets: [ref(cutthroat)] });
    return { game, cutthroat };
  };

  it("doubles the equipped creature's trigger, not another permanent's", () => {
    const { game } = equipped();
    destroy(game, spawn(game, "Grizzly Bears"));
    // Zulaport twice, Cruel Celebrant once.
    expect(life(game, B)).toBe(17);
  });

  it("the equipped creature's own death still triggers twice", () => {
    const { game, cutthroat } = equipped();
    destroy(game, cutthroat);
    expect(life(game, B)).toBe(17);
  });

  it("doubles an emblem its controller owns", () => {
    const { game } = equipped();
    const source = spawn(game, "Wastes");
    const emblem: EffectSpec = {
      kind: "create-emblem",
      text: "test emblem",
      triggered: [
        {
          trigger: { on: "dies", who: "any", filter: { type: "creature" } },
          targets: [],
          effect: { kind: "lose-life", who: "each-opponent", amount: 1 },
          resolve: null,
          text: "Whenever a creature dies, each opponent loses 1 life.",
        },
      ],
    };
    game.debugApplyEffect(A, emblem, [], { source });
    settle(game);
    destroy(game, spawn(game, "Grizzly Bears", B));
    // Bob's Bears: the emblem twice (Zulaport and the Celebrant see only
    // Alice's creatures).
    expect(life(game, B)).toBe(18);
  });
});
