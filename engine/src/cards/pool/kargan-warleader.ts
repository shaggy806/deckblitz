import { defineCard } from "../define.js";

// EDHREC rank 12585.

const LORD_TEXT = "Other Warriors you control get +1/+1.";

export default defineCard({
  name: "Kargan Warleader",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: LORD_TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Warrior" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});
