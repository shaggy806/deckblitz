import { defineCard } from "../define.js";

// EDHREC rank 8482. Commander 2017. Bastion Protector's anthem, with haste.
const TEXT = "Commander creatures you control get +2/+2 and have haste.";

export default defineCard({
  name: "Bloodsworn Steward",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, controlledBy: "you" } },
      grantPt: [2, 2],
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
