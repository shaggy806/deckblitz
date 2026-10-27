import { defineCard } from "../define.js";

export default defineCard({
  name: "Willbender",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  morph: { keyword: "morph", cost: "{1}{U}" },
  text: "Morph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, change the target of target spell or ability with a single target.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "stack", spells: "any", abilities: true, singleTarget: true }],
      effect: { kind: "change-targets", target: 0, how: "change" },
      resolve: null,
      text: "When this creature is turned face up, change the target of target spell or ability with a single target.",
    },
  ],
});
