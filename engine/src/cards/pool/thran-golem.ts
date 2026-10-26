import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 24411. Flaring Flame-Kin's condition.

export default defineCard({
  name: "Thran Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: "As long as this creature is enchanted, it gets +2/+2 and has flying, first strike, and trample.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantPt: [2, 2],
      grantKeywords: ["flying", "first-strike", "trample"],
      text: "As long as this creature is enchanted, it gets +2/+2 and has flying, first strike, and trample.",
    },
  ],
});
