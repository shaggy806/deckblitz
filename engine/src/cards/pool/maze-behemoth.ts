import { defineCard } from "../define.js";

const TEXT = "Multicolored creatures you control have trample.";

export default defineCard({
  name: "Maze Behemoth",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
