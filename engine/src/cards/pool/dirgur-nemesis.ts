import { defineCard } from "../define.js";

export default defineCard({
  name: "Dirgur Nemesis",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 5,
  keywords: ["defender"],
  morph: { keyword: "megamorph", cost: "{6}{U}" },
  text: "Defender\nMegamorph {6}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
