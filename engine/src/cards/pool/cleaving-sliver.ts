import { defineCard } from "../define.js";

export default defineCard({
  name: "Cleaving Sliver",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "Sliver creatures you control get +2/+0.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantPt: [2, 0],
      text: "Sliver creatures you control get +2/+0.",
    },
  ],
});
