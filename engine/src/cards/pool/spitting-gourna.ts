import { defineCard } from "../define.js";

export default defineCard({
  name: "Spitting Gourna",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  morph: { keyword: "morph", cost: "{4}{G}" },
  text: "Reach (This creature can block creatures with flying.)\nMorph {4}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
