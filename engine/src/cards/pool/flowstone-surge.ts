import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 29107.

export default defineCard({
  name: "Flowstone Surge",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Creatures you control get +1/-1.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, -1],
      text: "Creatures you control get +1/-1.",
    },
  ],
});
