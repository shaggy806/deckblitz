import { defineCard } from "../define.js";

// EDHREC rank 30752.

export default defineCard({
  name: "Zombie Cutthroat",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 4,
  morph: { keyword: "morph", cost: "", also: { payLife: 5 }, text: "Pay 5 life" },
  text: "Morph—Pay 5 life. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
