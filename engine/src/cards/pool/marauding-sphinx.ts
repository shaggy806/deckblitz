import { defineCard } from "../define.js";

// EDHREC rank 18282.

export default defineCard({
  name: "Marauding Sphinx",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Rogue"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance, ward {2}\nWhenever you commit a crime, surveil 2. This ability triggers only once each turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "Whenever you commit a crime, surveil 2. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
