import { defineCard } from "../define.js";

const LORD = "Other Minotaur creatures you control get +1/+1 and have trample.";

export default defineCard({
  name: "Rageblood Shaman",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${LORD}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Minotaur" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: LORD,
    },
  ],
});
