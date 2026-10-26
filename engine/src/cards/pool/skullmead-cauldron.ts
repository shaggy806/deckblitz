import { defineCard } from "../define.js";

// Dissension.
export default defineCard({
  name: "Skullmead Cauldron",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{T}: You gain 1 life.\n{T}, Discard a card: You gain 3 life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{T}: You gain 1 life.",
    },
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{T}, Discard a card: You gain 3 life.",
    },
  ],
});
