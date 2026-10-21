import { defineCard } from "../define.js";

// EDHREC rank 17364.

export default defineCard({
  name: "Diamond Valley",
  colors: [],
  types: ["land"],
  text: "{T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: "{T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.",
    },
  ],
});
