import { defineCard } from "../define.js";

export default defineCard({
  name: "Towering Baloth",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 6,
  morph: { keyword: "morph", cost: "{6}{G}" },
  text: "Morph {6}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
