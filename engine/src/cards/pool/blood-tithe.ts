import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Tithe",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent loses 3 life. You gain life equal to the life lost this way.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 3, who: "each-opponent" },
      { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
    ],
  },
});
