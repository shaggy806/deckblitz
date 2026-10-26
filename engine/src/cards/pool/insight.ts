import { defineCard } from "../define.js";

// EDHREC rank 11080.

const TEXT = "Whenever an opponent casts a green spell, you draw a card.";

export default defineCard({
  name: "Insight",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
