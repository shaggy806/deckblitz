import { defineCard } from "../define.js";

// EDHREC rank 28209.
//
// Rulings:
//   The -1/-0 applies to attacking creatures from all players.

export default defineCard({
  name: "Weakstone",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "Attacking creatures get -1/-0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true } },
      grantPt: [-1, 0],
      text: "Attacking creatures get -1/-0.",
    },
  ],
});
