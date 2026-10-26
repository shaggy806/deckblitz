import { defineCard } from "../define.js";

// EDHREC rank 25600.
//
// Rulings:
//   [2011-01-22] The ability will trigger only once per combat, even if the enchanted creature
//     somehow blocks multiple attacking creatures.

const TEXT = "Whenever enchanted creature blocks, you gain 3 life.";

export default defineCard({
  name: "Favor of the Woods",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "blocks", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
