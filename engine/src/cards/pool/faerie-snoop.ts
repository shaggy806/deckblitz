import { defineCard } from "../define.js";

// EDHREC rank 23578.

const DISGUISE =
  "Disguise {1}{U/B}{U/B} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, look at the top two cards of your library. Put one into your hand and the other into your graveyard.";

export default defineCard({
  name: "Faerie Snoop",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Faerie", "Detective"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DISGUISE}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{U/B}{U/B}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      // Codecracker Hound's look.
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
