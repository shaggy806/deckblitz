import { defineCard } from "../define.js";

export default defineCard({
  name: "Titanic Bulvox",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 4,
  keywords: ["trample"],
  morph: { keyword: "morph", cost: "{4}{G}{G}{G}" },
  text: "Trample\nMorph {4}{G}{G}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
