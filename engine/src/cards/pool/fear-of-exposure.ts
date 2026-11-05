import { defineCard } from "../define.js";

export default defineCard({
  name: "Fear of Exposure",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: "As an additional cost to cast this spell, tap two untapped creatures and/or lands you control.\nTrample",
  additionalCost: {
    also: {
      text: "Tap two untapped creatures and/or lands you control",
      tapUntapped: { filter: { typesAnyOf: ["creature", "land"] }, count: 2 },
    },
  },
});
