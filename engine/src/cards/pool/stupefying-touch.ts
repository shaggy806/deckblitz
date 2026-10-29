import { defineCard } from "../define.js";

// EDHREC rank 24923.
//
// Mana abilities are stopped too (its ruling): no `exceptManaAbilities`.

export default defineCard({
  name: "Stupefying Touch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature's activated abilities can't be activated.",
  targets: ["creature"],
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
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature's activated abilities can't be activated.",
    },
  ],
});
