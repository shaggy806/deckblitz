import { defineCard } from "../define.js";

// Planar Chaos (PLC). Horned Sliver's shape: every Sliver creature, whoever
// controls it.
const TEXT = "All Sliver creatures have trample.";

export default defineCard({
  name: "Battering Sliver",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
