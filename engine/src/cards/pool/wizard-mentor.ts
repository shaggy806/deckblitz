import { defineCard } from "../define.js";

// EDHREC rank 27124.
//
// Rulings:
//   [2004-10-04] Can target itself.
//
// Both returns are one sequence: the source (if still there), then the target.
// Targeting itself, the second return finds it already gone and does nothing.
const TEXT = "{T}: Return this creature and target creature you control to their owner's hand.";

export default defineCard({
  name: "Wizard Mentor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          { kind: "return-to-hand", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
