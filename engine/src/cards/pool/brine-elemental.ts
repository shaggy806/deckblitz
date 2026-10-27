import { defineCard } from "../define.js";

export default defineCard({
  name: "Brine Elemental",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 4,
  morph: { keyword: "morph", cost: "{5}{U}{U}" },
  text: "Morph {5}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, each opponent skips their next untap step.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "skip-untap-step", who: "each-opponent" },
      resolve: null,
      text: "When this creature is turned face up, each opponent skips their next untap step.",
    },
  ],
});
