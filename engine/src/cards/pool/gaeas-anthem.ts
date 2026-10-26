import { defineCard } from "../define.js";

// EDHREC rank 9044.

export default defineCard({
  name: "Gaea's Anthem",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      text: "Creatures you control get +1/+1.",
    },
  ],
});
