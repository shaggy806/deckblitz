import { defineCard } from "../define.js";

export default defineCard({
  name: "Fire Nation's Conquest",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Creatures you control get +1/+0.",
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 0], text: "Creatures you control get +1/+0." }],
});
