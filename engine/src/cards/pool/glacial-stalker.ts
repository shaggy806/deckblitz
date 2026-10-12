import { defineCard } from "../define.js";

export default defineCard({
  name: "Glacial Stalker",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 5,
  morph: { keyword: "morph", cost: "{4}{U}" },
  text: "Morph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
