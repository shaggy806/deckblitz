import { defineCard } from "../define.js";

// EDHREC rank 25528.

export default defineCard({
  name: "Maze Rusher",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nMulticolored creatures you control have haste.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantKeywords: ["haste"],
      text: "Multicolored creatures you control have haste.",
    },
  ],
});
