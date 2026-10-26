import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] As long as the player is a legal target when Geth's Verdict resolves, that player
//     loses 1 life even if they didn't sacrifice a creature.

export default defineCard({
  name: "Geth's Verdict",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player sacrifices a creature of their choice and loses 1 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "lose-life", amount: 1, target: 0 },
    ],
  },
});
