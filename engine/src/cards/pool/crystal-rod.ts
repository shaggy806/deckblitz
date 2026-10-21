import { defineCard } from "../define.js";

// EDHREC rank 26840.

export default defineCard({
  name: "Crystal Rod",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "Whenever a player casts a blue spell, you may pay {1}. If you do, you gain 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["U"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to gain 1 life?", cost: "{1}", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: "Whenever a player casts a blue spell, you may pay {1}. If you do, you gain 1 life.",
    },
  ],
});
