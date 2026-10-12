import { defineCard } from "../define.js";

export default defineCard({
  name: "Grinning Demon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  morph: { keyword: "morph", cost: "{2}{B}{B}" },
  text: "At the beginning of your upkeep, you lose 2 life.\nMorph {2}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 2 life.",
    },
  ],
});
