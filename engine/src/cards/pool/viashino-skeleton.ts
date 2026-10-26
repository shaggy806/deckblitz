import { defineCard } from "../define.js";

// EDHREC rank 31517. Shards of Alara.

export default defineCard({
  name: "Viashino Skeleton",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Skeleton"],
  power: 2,
  toughness: 1,
  text: "{1}{B}, Discard a card: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}, Discard a card: Regenerate this creature.",
    },
  ],
});
