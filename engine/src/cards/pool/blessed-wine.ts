import { defineCard } from "../define.js";

export default defineCard({
  name: "Blessed Wine",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 1 life.\nDraw a card at the beginning of the next turn's upkeep.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 1 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
