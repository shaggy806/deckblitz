import { defineCard } from "../define.js";

export default defineCard({
  name: "Krumar Bond-Kin",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 5,
  toughness: 3,
  morph: { keyword: "morph", cost: "{4}{B}" },
  text: "Morph {4}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
