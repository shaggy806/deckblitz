import { defineCard } from "../define.js";

export default defineCard({
  name: "Monastery Flock",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 5,
  keywords: ["defender", "flying"],
  morph: { keyword: "morph", cost: "{U}" },
  text: "Defender, flying\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
