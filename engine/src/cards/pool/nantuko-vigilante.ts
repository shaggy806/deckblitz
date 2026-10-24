import { defineCard } from "../define.js";

const UP_TEXT = "When this creature is turned face up, destroy target artifact or enchantment.";

export default defineCard({
  name: "Nantuko Vigilante",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid", "Mutant"],
  power: 3,
  toughness: 2,
  morph: { keyword: "morph", cost: "{1}{G}" },
  text: `Morph {1}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
