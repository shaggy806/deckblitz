import { defineCard } from "../define.js";

// EDHREC rank 12505. Disguise {G}; turned face up, Sprouting Goblin's search
// for "a land card with a basic land type".
const FACE_UP =
  "When this creature is turned face up, search your library for a land card with a basic land type, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Nervous Gardener",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 2,
  text: `Disguise {G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP}`,
  morph: { keyword: "disguise", cost: "{G}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", subtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
