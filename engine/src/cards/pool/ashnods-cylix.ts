import { defineCard } from "../define.js";

// The target player looks and chooses: their own library and their choice.
const TEXT =
  "{3}, {T}: Target player looks at the top three cards of their library, puts one of them back on top of their library, then exiles the rest.";

export default defineCard({
  name: "Ashnod's Cylix",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "library",
          count: 3,
          min: 1,
          max: 1,
          destination: "library-top",
          leftover: "exile",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
