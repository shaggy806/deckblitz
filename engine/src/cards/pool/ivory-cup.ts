import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 25020.
const TEXT = "Whenever a player casts a white spell, you may pay {1}. If you do, you gain 1 life.";

export default defineCard({
  name: "Ivory Cup",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to gain 1 life?", cost: "{1}", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
