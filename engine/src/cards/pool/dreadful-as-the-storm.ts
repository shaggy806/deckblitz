import { defineCard } from "../define.js";

// EDHREC rank 16420.
//
// Rulings:
//   [2023-06-16] Some spells and abilities that cause the Ring to tempt you may require targets.
//     If each target chosen is an illegal target as that spell or ability tries to resolve, it
//     won't resolve. The Ring won't tempt you.
//
// Quandrix Charm's base 5/5 (layer 7b), then the Ring tempts you.

export default defineCard({
  name: "Dreadful as the Storm",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature has base power and toughness 5/5 until end of turn. The Ring tempts you.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
