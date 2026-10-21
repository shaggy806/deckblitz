import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 24559.
//
// Rulings:
//   [2004-10-04] Whenever the land is tapped for any reason, the ability triggers.
//
// "That land's controller" is the trigger object's controller.
const TEXT = "Whenever enchanted land becomes tapped, this Aura deals 2 damage to that land's controller.";

export default defineCard({
  name: "Psychic Venom",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
