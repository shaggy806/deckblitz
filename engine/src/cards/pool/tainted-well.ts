import { defineCard } from "../define.js";

// EDHREC rank 26170. Rule 305.7: the enchanted land loses its other land
// types and rules-text abilities and gains "{T}: Add {B}" (as Blood Moon).

export default defineCard({
  name: "Tainted Well",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nWhen this Aura enters, draw a card.\nEnchanted land is a Swamp.",
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Swamp"],
      text: "Enchanted land is a Swamp.",
    },
  ],
});
