import { defineCard } from "../define.js";

export default defineCard({
  name: "Sootfeather Flock",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{3}{B}" },
  text: "Flying\nMorph {3}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
