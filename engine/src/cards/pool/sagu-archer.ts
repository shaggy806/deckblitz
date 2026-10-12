import { defineCard } from "../define.js";

export default defineCard({
  name: "Sagu Archer",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Archer"],
  power: 2,
  toughness: 5,
  keywords: ["reach"],
  morph: { keyword: "morph", cost: "{4}{G}" },
  text: "Reach (This creature can block creatures with flying.)\nMorph {4}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
