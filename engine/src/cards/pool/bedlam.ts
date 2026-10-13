import { defineCard } from "../define.js";

// EDHREC rank 6974.
//
// Every creature on the battlefield, whoever controls it.
export default defineCard({
  name: "Bedlam",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Creatures can't block.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: ["cant-block"],
      text: "Creatures can't block.",
    },
  ],
});
