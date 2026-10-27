import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 12558.

export default defineCard({
  name: "Voidmage Apprentice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{U}{U}" },
  text: "Morph {2}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, counter target spell.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "When this creature is turned face up, counter target spell.",
    },
  ],
});
