import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 21886.
//
// Rulings:
//   [2018-04-27] Skizzik's ability checks at each end step whether it was kicked while it was
//     being cast. You don't have to pay its kicker cost each turn (and can't do so, even if you
//     really want to kick it again).
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

export default defineCard({
  name: "Skizzik",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 3,
  keywords: ["trample", "haste"],
  kicker: { cost: "{R}" },
  text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nTrample, haste\nAt the beginning of the end step, if this creature wasn't kicked, sacrifice it.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "not", of: { kind: "self-kicked" } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, if this creature wasn't kicked, sacrifice it.",
    },
  ],
});
