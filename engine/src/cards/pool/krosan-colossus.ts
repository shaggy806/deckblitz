import { defineCard } from "../define.js";

export default defineCard({
  name: "Krosan Colossus",
  manaCost: "{6}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 9,
  toughness: 9,
  morph: { keyword: "morph", cost: "{6}{G}{G}" },
  text: "Morph {6}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
