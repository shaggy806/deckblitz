import { defineCard } from "../define.js";

export default defineCard({
  name: "Sleeper's Guile",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has fear. (It can't be blocked except by artifact creatures and/or black creatures.)\nWhen this Aura is put into a graveyard from the battlefield, return it to its owner's hand.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["fear"],
      text: "Enchanted creature has fear.",
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
