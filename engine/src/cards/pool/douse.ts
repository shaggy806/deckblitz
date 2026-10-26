import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 20748.

export default defineCard({
  name: "Douse",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{1}{U}: Counter target red spell.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "spell", filter: { colors: ["R"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{1}{U}: Counter target red spell.",
    },
  ],
});
