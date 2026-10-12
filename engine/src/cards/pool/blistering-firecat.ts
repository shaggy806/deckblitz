import { defineCard } from "../define.js";

export default defineCard({
  name: "Blistering Firecat",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 7,
  toughness: 1,
  keywords: ["trample", "haste"],
  morph: { keyword: "morph", cost: "{R}{R}" },
  text: "Trample, haste\nAt the beginning of the end step, sacrifice this creature.\nMorph {R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this creature.",
    },
  ],
});
