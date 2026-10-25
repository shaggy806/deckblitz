import { defineCard } from "../define.js";

// EDHREC rank 13009.

const TEXT = "Other Warrior creatures you control have vigilance.";

export default defineCard({
  name: "Herald of Dromoka",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Warrior" },
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
