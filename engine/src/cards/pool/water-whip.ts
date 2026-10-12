import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 11552.
//
// "Waterbend {5}" as an additional cost (rule 701.67a): {5} more on its total
// cost, any of it paid by tapping artifacts and creatures. Displace's two
// optional slots, returned together, then the draw.

export default defineCard({
  name: "Water Whip",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "As an additional cost to cast this spell, waterbend {5}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\nReturn up to two target creatures to their owners' hands. Draw two cards.",
  additionalCost: { waterbend: 5 },
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      { kind: "draw", amount: 2 },
    ],
  },
});
