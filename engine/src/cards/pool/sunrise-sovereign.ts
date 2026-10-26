import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunrise Sovereign",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 5,
  text: "Other Giant creatures you control get +2/+2 and have trample.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Giant" },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: "Other Giant creatures you control get +2/+2 and have trample.",
    },
  ],
});
