import { defineCard } from "../define.js";

const TEXT = "Elves you control get +2/+0.";

export default defineCard({
  name: "Pride of the Perfect",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Elf" },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
