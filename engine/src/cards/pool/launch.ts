import { defineCard } from "../define.js";

// EDHREC rank 22615.

export default defineCard({
  name: "Launch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has flying.\nWhen this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
    },
  ],
});
