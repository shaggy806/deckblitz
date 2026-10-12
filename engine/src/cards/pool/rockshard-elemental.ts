import { defineCard } from "../define.js";

export default defineCard({
  name: "Rockshard Elemental",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 3,
  keywords: ["double-strike"],
  morph: { keyword: "morph", cost: "{4}{R}{R}" },
  text: "Double strike (This creature deals both first-strike and regular combat damage.)\nMorph {4}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
