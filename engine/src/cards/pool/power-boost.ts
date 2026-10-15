import { defineCard } from "../define.js";

// EDHREC rank 27321.

export default defineCard({
  name: "Power Boost",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Creatures you control get +1/+0.",
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 0], text: "Creatures you control get +1/+0." }],
});
