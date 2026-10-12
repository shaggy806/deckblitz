import { defineCard } from "../define.js";

export default defineCard({
  name: "Stormcrag Elemental",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  morph: { keyword: "megamorph", cost: "{4}{R}{R}" },
  text: "Trample\nMegamorph {4}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
