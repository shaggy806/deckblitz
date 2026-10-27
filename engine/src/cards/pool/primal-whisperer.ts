import { defineCard } from "../define.js";

// EDHREC rank 20125. Counts every face-down creature, each player's.

export default defineCard({
  name: "Primal Whisperer",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{G}" },
  text: "This creature gets +2/+2 for each face-down creature on the battlefield.\nMorph {3}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "creature", faceDown: true }, pt: [2, 2] },
      text: "This creature gets +2/+2 for each face-down creature on the battlefield.",
    },
  ],
});
