import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 7332.
//
// Every black creature, whoever controls it — this one's opponents' included.
export default defineCard({
  name: "Bad Moon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Black creatures get +1/+1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"] } },
      grantPt: [1, 1],
      text: "Black creatures get +1/+1.",
    },
  ],
});
