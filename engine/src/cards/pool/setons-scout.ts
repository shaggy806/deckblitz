import { defineCard } from "../define.js";

// Torment. EDHREC rank 29892.

export default defineCard({
  name: "Seton's Scout",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Druid", "Scout", "Archer"],
  power: 2,
  toughness: 1,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nThreshold — This creature gets +2/+2 as long as there are seven or more cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      text: "Threshold — This creature gets +2/+2 as long as there are seven or more cards in your graveyard.",
    },
  ],
});
