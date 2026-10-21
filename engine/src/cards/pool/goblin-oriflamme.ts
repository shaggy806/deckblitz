import { defineCard } from "../define.js";

// EDHREC rank 13852.

const TEXT = "Attacking creatures you control get +1/+0.";

export default defineCard({
  name: "Goblin Oriflamme",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
