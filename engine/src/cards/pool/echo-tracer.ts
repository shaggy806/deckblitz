import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 16722.

export default defineCard({
  name: "Echo Tracer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: "Morph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, return target creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When this creature is turned face up, return target creature to its owner's hand.",
    },
  ],
});
