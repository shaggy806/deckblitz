import { defineCard } from "../define.js";

const TEXT = "Other Centaur creatures you control get +1/+1 and have vigilance and trample.";

export default defineCard({
  name: "Pheres-Band Warchief",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Centaur", excludeSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["vigilance", "trample"],
      text: TEXT,
    },
  ],
});
