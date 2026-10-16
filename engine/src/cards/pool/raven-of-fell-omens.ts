import { defineCard } from "../define.js";

// EDHREC rank 11632.

export default defineCard({
  name: "Raven of Fell Omens",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever you commit a crime, each opponent loses 1 life and you gain 1 life. This ability triggers only once each turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)",
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you commit a crime, each opponent loses 1 life and you gain 1 life. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
