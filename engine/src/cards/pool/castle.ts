import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 18227.
const TEXT = "Untapped creatures you control get +0/+2.";

export default defineCard({
  name: "Castle",
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
