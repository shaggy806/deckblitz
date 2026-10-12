import { defineCard } from "../define.js";

export default defineCard({
  name: "Marsh Hulk",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Ogre"],
  power: 4,
  toughness: 6,
  morph: { keyword: "megamorph", cost: "{6}{B}" },
  text: "Megamorph {6}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
