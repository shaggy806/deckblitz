import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 21568. Talon Sliver's shape: every player's
// Sliver creatures.

const TEXT = "All Sliver creatures have first strike.";

export default defineCard({
  name: "Spitting Sliver",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
