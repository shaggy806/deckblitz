import { defineCard } from "../define.js";

export default defineCard({
  name: "Treespring Lorian",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  morph: { keyword: "morph", cost: "{5}{G}" },
  text: "Morph {5}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
