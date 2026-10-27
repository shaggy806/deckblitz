import { defineCard } from "../define.js";

export default defineCard({
  name: "Shaleskin Plower",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 2,
  morph: { keyword: "morph", cost: "{4}{R}" },
  text: "Morph {4}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, destroy target land.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature is turned face up, destroy target land.",
    },
  ],
});
