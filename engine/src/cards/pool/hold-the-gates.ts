import { defineCard } from "../define.js";

const TEXT = "Creatures you control get +0/+1 for each Gate you control and have vigilance.";

export default defineCard({
  name: "Hold the Gates",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { filter: { subtype: "Gate", controlledBy: "you" }, pt: [0, 1] },
      grantKeywords: ["vigilance"],
      text: TEXT,
    },
  ],
});
