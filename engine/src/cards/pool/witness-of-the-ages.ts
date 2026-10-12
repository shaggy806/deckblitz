import { defineCard } from "../define.js";

export default defineCard({
  name: "Witness of the Ages",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  morph: { keyword: "morph", cost: "{5}" },
  text: "Morph {5} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
