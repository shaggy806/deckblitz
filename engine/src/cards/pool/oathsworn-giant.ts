import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 14631.
const TEXT = "Other creatures you control get +0/+2 and have vigilance.";

export default defineCard({
  name: "Oathsworn Giant",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      grantPt: [0, 2],
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
