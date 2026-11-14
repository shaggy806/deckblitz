import { defineCard } from "../define.js";

// EDHREC rank 26593. Mightstone's static, only during its controller's turn.
const TEXT = "During your turn, attacking creatures get +1/+0.";

export default defineCard({
  name: "Raph's Bravado",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true } },
      condition: { kind: "your-turn" },
      grantPt: [1, 0],
      text: TEXT,
    },
  ],
});
