import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 32129.

const TEXT = "When this creature is turned face up, untap it.";

export default defineCard({
  name: "Liege of the Axe",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  morph: { keyword: "morph", cost: "{1}{W}" },
  text: `Vigilance\nMorph {1}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
