import { defineCard } from "../define.js";

export default defineCard({
  name: "Fear of Isolation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "As an additional cost to cast this spell, return a permanent you control to its owner's hand.\nFlying",
  additionalCost: {
    also: { text: "Return a permanent you control to its owner's hand", returnToHand: { filter: {}, count: 1 } },
  },
});
