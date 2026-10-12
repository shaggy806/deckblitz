import { defineCard } from "../define.js";

export default defineCard({
  name: "Snowhorn Rider",
  manaCost: "{3}{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  morph: { keyword: "morph", cost: "{2}{G}{U}{R}" },
  text: "Trample\nMorph {2}{G}{U}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
