import { defineCard } from "../define.js";

export default defineCard({
  name: "Charging Slateback",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 3,
  morph: { keyword: "morph", cost: "{4}{R}" },
  text: "This creature can't block.\nMorph {4}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
