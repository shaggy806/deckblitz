import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 31122.

export default defineCard({
  name: "Bloodstoke Howler",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  morph: { keyword: "morph", cost: "{6}{R}" },
  text: "Morph {6}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, Beast creatures you control get +3/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Beast", controlledBy: "you" },
        power: 3,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature is turned face up, Beast creatures you control get +3/+0 until end of turn.",
    },
  ],
});
