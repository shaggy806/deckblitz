import { defineCard } from "../define.js";

// EDHREC rank 4983.
//
// Draw, then blight 1 (rule 701.68a): Alice chooses a creature she controls —
// this one included — and puts a -1/-1 counter on it.

const END_TEXT = "At the beginning of your end step, draw a card and blight 1.";

export default defineCard({
  name: "Sinister Gnarlbark",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warlock"],
  power: 0,
  toughness: 4,
  text: "At the beginning of your end step, draw a card and blight 1. (Put a -1/-1 counter on a creature you control.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "blight", amount: 1 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
