import { defineCard } from "../define.js";

export default defineCard({
  name: "Scornful Egotist",
  manaCost: "{7}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}" },
  text: "Morph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
