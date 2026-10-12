import { defineCard } from "../define.js";

export default defineCard({
  name: "Canyon Lurkers",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 5,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{R}" },
  text: "Morph {3}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
