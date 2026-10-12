import { defineCard } from "../define.js";

export default defineCard({
  name: "Sagu Mauler",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample", "hexproof"],
  morph: { keyword: "morph", cost: "{3}{G}{U}" },
  text: "Trample, hexproof\nMorph {3}{G}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
