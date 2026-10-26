import { defineCard } from "../define.js";

const TEXT = "Untapped creatures you control get +0/+2.";

export default defineCard({
  name: "Builder's Blessing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: false } },
      grantPt: [0, 2],
      text: TEXT,
    },
  ],
});
