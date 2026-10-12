import { defineCard } from "../define.js";

export default defineCard({
  name: "Branchsnap Lorian",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 1,
  keywords: ["trample"],
  morph: { keyword: "morph", cost: "{G}" },
  text: "Trample\nMorph {G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
