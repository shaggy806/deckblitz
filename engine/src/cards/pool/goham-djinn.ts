import { defineCard } from "../define.js";

// EDHREC rank 32209.

export default defineCard({
  name: "Goham Djinn",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 5,
  text: "{1}{B}: Regenerate this creature.\nThis creature gets -2/-2 as long as black is the most common color among all permanents or is tied for most common.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPt: [-2, -2],
      text: "This creature gets -2/-2 as long as black is the most common color among all permanents or is tied for most common.",
      condition: { kind: "most-common-color", color: "B" },
    },
  ],
});
