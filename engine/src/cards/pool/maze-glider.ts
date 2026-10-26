import { defineCard } from "../define.js";

// EDHREC rank 25048.

export default defineCard({
  name: "Maze Glider",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nMulticolored creatures you control have flying.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantKeywords: ["flying"],
      text: "Multicolored creatures you control have flying.",
    },
  ],
});
