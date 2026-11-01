import { defineCard } from "../define.js";

export default defineCard({
  name: "Knowledge Is Power",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "Creatures you control get +X/+X, where X is the number of cards you've drawn this turn.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { turnStat: "cards-drawn", pt: [1, 1] },
      text: "Creatures you control get +X/+X, where X is the number of cards you've drawn this turn.",
    },
  ],
});
