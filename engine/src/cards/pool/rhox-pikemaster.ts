import { defineCard } from "../define.js";

// EDHREC rank 23828.
export default defineCard({
  name: "Rhox Pikemaster",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nOther Soldier creatures you control have first strike.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Soldier" },
      grantKeywords: ["first-strike"],
      text: "Other Soldier creatures you control have first strike.",
    },
  ],
});
