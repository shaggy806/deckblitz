import { defineCard } from "../define.js";

export default defineCard({
  name: "Honor of the Pure",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "White creatures you control get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      grantPt: [1, 1],
      text: "White creatures you control get +1/+1.",
    },
  ],
});
