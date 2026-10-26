import { defineCard } from "../define.js";

// EDHREC rank 26091.
//
// Rulings:
//   [2007-05-01] This will always be shuffled into its owner's library.

const TEXT = "When this creature dies, shuffle it into its owner's library.";

export default defineCard({
  name: "Alabaster Dragon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
