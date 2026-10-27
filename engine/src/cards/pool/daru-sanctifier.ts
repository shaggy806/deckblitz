import { defineCard } from "../define.js";

export default defineCard({
  name: "Daru Sanctifier",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 4,
  morph: { keyword: "morph", cost: "{1}{W}" },
  text: "Morph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, destroy target enchantment.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature is turned face up, destroy target enchantment.",
    },
  ],
});
