import { defineCard } from "../define.js";

// EDHREC rank 27929. Every player's attacking creatures (its ruling).

export default defineCard({
  name: "Mightstone",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "Attacking creatures get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true } },
      grantPt: [1, 0],
      text: "Attacking creatures get +1/+0.",
    },
  ],
});
