import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 22218.

export default defineCard({
  name: "War Horn",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Attacking creatures you control get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Attacking creatures you control get +1/+0.",
    },
  ],
});
