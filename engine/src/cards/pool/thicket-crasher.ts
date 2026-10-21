import { defineCard } from "../define.js";

// EDHREC rank 13966.

export default defineCard({
  name: "Thicket Crasher",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Rhino"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nOther Elementals you control have trample.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Elemental" },
      grantKeywords: ["trample"],
      text: "Other Elementals you control have trample.",
    },
  ],
});
