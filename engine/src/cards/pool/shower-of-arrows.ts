import { defineCard } from "../define.js";

// EDHREC rank 8708.

export default defineCard({
  name: "Shower of Arrows",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact, enchantment, or creature with flying. Scry 1.",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "scry", amount: 1 },
    ],
  },
});
