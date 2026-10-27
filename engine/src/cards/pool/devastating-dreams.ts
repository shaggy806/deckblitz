import { defineCard } from "../define.js";

// EDHREC rank 23705. Torment.

export default defineCard({
  name: "Devastating Dreams",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard X cards at random.\nEach player sacrifices X lands of their choice. Devastating Dreams deals X damage to each creature.",
  additionalCost: { discard: "x", discardAtRandom: true },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-player", filter: { type: "land" }, count: "x" },
      { kind: "damage-all", filter: { type: "creature" }, amount: "x" },
    ],
  },
});
