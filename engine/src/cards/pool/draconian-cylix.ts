import { defineCard } from "../define.js";

export default defineCard({
  name: "Draconian Cylix",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Discard a card at random: Regenerate target creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, discard: { count: 1, random: true } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{2}, {T}, Discard a card at random: Regenerate target creature.",
    },
  ],
});
