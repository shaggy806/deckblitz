import { defineCard } from "../define.js";

export default defineCard({
  name: "Last Caress",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player loses 1 life and you gain 1 life.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
