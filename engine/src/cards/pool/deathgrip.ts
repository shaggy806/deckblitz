import { defineCard } from "../define.js";

// EDHREC rank 17972.

export default defineCard({
  name: "Deathgrip",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{B}{B}: Counter target green spell.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [{ kind: "spell", filter: { colors: ["G"] } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{B}{B}: Counter target green spell.",
    },
  ],
});
