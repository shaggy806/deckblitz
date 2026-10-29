import { defineCard } from "../define.js";

// EDHREC rank 6385.
// Two colorless cards share no color (the ruling); it repeats as long as each pass mills a pair that
// shares one.

export default defineCard({
  name: "Grindstone",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Target player mills two cards. If two cards that share a color were milled this way, repeat this process.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: {
        kind: "repeat",
        effect: { kind: "mill", target: 0, amount: 2 },
        again: { kind: "this-way", what: "milled", sharing: "color", atLeast: 2 },
      },
      resolve: null,
      text: "{3}, {T}: Target player mills two cards. If two cards that share a color were milled this way, repeat this process.",
    },
  ],
});
