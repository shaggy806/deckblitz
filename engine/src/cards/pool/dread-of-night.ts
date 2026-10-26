import { defineCard } from "../define.js";

// EDHREC rank 26872. Every white creature, whoever controls it.

const TEXT = "White creatures get -1/-1.";

export default defineCard({
  name: "Dread of Night",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      grantPt: [-1, -1],
      text: TEXT,
    },
  ],
});
