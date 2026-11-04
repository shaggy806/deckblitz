import { defineCard } from "../define.js";

export default defineCard({
  name: "Reverse Polarity",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain X life, where X is twice the damage dealt to you so far this turn by artifacts.",
  effect: {
    kind: "gain-life",
    amount: {
      product: [2, { damageDealtThisTurn: true, who: "each-player", to: "you", by: { type: "artifact" } }],
    },
  },
});
