import { defineCard } from "../define.js";

// Dissension. EDHREC rank 29939.

export default defineCard({
  name: "Demon's Jester",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nHellbent — This creature gets +2/+1 as long as you have no cards in hand.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantPt: [2, 1],
      text: "Hellbent — This creature gets +2/+1 as long as you have no cards in hand.",
    },
  ],
});
