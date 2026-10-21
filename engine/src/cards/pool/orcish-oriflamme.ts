import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 22437.
export default defineCard({
  name: "Orcish Oriflamme",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Attacking creatures you control get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Attacking creatures you control get +1/+0.",
    },
  ],
});
