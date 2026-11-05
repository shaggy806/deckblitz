import { defineCard } from "../define.js";

// "All other tapped creatures": never Thousand Winds itself, tapped or not,
// wherever it is as this resolves (its ruling).
const FACE_UP = "When this creature is turned face up, return all other tapped creatures to their owners' hands.";

export default defineCard({
  name: "Thousand Winds",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{5}{U}{U}" },
  text: `Flying\nMorph {5}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", tapped: true },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
