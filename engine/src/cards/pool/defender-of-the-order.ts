import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 31334.

export default defineCard({
  name: "Defender of the Order",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 4,
  morph: { keyword: "morph", cost: "{W}{W}" },
  text: "Morph {W}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, creatures you control get +0/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 0,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature is turned face up, creatures you control get +0/+2 until end of turn.",
    },
  ],
});
