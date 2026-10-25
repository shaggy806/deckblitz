import { defineCard } from "../define.js";

export default defineCard({
  name: "Spidersilk Armor",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Creatures you control get +0/+1 and have reach. (They can block creatures with flying.)",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      grantKeywords: ["reach"],
      text: "Creatures you control get +0/+1 and have reach.",
    },
  ],
});
