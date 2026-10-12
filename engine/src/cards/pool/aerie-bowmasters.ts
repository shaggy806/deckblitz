import { defineCard } from "../define.js";

export default defineCard({
  name: "Aerie Bowmasters",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Archer"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  morph: { keyword: "megamorph", cost: "{5}{G}" },
  text: "Reach (This creature can block creatures with flying.)\nMegamorph {5}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
