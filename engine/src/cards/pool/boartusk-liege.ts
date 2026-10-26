import { defineCard } from "../define.js";

// Ruling: the two abilities are separate and cumulative — a red and green creature gets +2/+2.

export default defineCard({
  name: "Boartusk Liege",
  manaCost: "{1}{R/G}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Goblin", "Knight"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nOther red creatures you control get +1/+1.\nOther green creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other red creatures you control get +1/+1.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other green creatures you control get +1/+1.",
    },
  ],
});
