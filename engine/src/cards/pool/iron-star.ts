import { defineCard } from "../define.js";

// EDHREC rank 27456.

export default defineCard({
  name: "Iron Star",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "Whenever a player casts a red spell, you may pay {1}. If you do, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to gain 1 life?", cost: "{1}", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: "Whenever a player casts a red spell, you may pay {1}. If you do, you gain 1 life.",
    },
  ],
});
