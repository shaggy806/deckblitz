import { defineCard } from "../define.js";

const TEXT = "When this creature is turned face up, you may turn target creature with a morph ability face down.";

export default defineCard({
  name: "Master of the Veil",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `Morph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", hasKeyword: "morph" } }],
      effect: {
        kind: "may",
        prompt: "Turn the targeted creature face down?",
        effect: { kind: "turn-face-down", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
