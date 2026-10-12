import { defineCard } from "../define.js";

export default defineCard({
  name: "Spined Basher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Beast"],
  power: 3,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{B}" },
  text: "Morph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
