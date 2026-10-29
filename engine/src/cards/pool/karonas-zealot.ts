import { defineCard } from "../define.js";

// Rulings: with the target gone or no longer a creature, the damage isn't
// redirected (rule 614.9) — it's dealt to this creature as usual.

export default defineCard({
  name: "Karona's Zealot",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 5,
  morph: { keyword: "morph", cost: "{3}{W}{W}" },
  text: "Morph {3}{W}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, all damage that would be dealt to it this turn is dealt to target creature instead.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage-rule", to: { target: "source" }, redirectTo: 0 },
      resolve: null,
      text: "When this creature is turned face up, all damage that would be dealt to it this turn is dealt to target creature instead.",
    },
  ],
});
