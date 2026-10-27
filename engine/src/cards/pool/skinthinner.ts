import { defineCard } from "../define.js";

export default defineCard({
  name: "Skinthinner",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{3}{B}{B}" },
  text: "Morph {3}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, destroy target nonblack creature. It can't be regenerated.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "When this creature is turned face up, destroy target nonblack creature. It can't be regenerated.",
    },
  ],
});
