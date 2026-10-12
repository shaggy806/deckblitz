import { defineCard } from "../define.js";

export default defineCard({
  name: "Marang River Skeleton",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  morph: { keyword: "megamorph", cost: "{3}{B}" },
  text: "{B}: Regenerate this creature.\nMegamorph {3}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
