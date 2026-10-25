import { defineCard } from "../define.js";

// EDHREC rank 20522.

const FACE_UP = "When this creature is turned face up, creatures you control get +2/+2 until end of turn.";

export default defineCard({
  name: "Master of Pearls",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{W}{W}" },
  text: `Morph {3}{W}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
