import { defineCard } from "../define.js";

export default defineCard({
  name: "Woolly Loxodon",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Warrior"],
  power: 6,
  toughness: 7,
  morph: { keyword: "morph", cost: "{5}{G}" },
  text: "Morph {5}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
