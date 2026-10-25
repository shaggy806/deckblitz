import { defineCard } from "../define.js";

// EDHREC rank 18763. Khans of Tarkir.

const FACE_UP_TEXT = "When this creature is turned face up, target creature you control gains hexproof until end of turn.";

export default defineCard({
  name: "Mistfire Weaver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `Flying\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
