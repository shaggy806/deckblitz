import { defineCard } from "../define.js";

// EDHREC rank 13381.

export default defineCard({
  name: "Jester's Cap",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Search target player's library for three cards and exile them. Then that player shuffles.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: {
        kind: "search-library",
        whose: { target: 0 },
        filter: {},
        destination: "exile",
        min: 3,
        max: 3,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Search target player's library for three cards and exile them. Then that player shuffles.",
    },
  ],
});
