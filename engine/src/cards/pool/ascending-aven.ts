import { defineCard } from "../define.js";

export default defineCard({
  name: "Ascending Aven",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: "Flying\nThis creature can block only creatures with flying.\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
