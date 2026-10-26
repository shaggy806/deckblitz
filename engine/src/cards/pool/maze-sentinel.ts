import { defineCard } from "../define.js";

const TEXT = "Multicolored creatures you control have vigilance.";

export default defineCard({
  name: "Maze Sentinel",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
