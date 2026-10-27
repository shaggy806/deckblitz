import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 22804. Granite Witness's face-up trigger over
// any permanent: the target is chosen as the trigger goes on the stack; tap,
// untap or neither is chosen as it resolves.

const FACE_UP_TEXT = "When this creature is turned face up, you may tap or untap target permanent.";

export default defineCard({
  name: "Coral Trickster",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}" },
  text: `Morph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["permanent"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
