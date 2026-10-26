import { defineCard } from "../define.js";

export default defineCard({
  name: "Lumithread Field",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  morph: { keyword: "morph", cost: "{1}{W}" },
  text: "Creatures you control get +0/+1.\nMorph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      text: "Creatures you control get +0/+1.",
    },
  ],
});
