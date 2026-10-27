import { defineCard } from "../define.js";

// Each opponent, in turn order, chooses whether to pay {2}; then each one who
// didn't sacrifices a permanent of their choice.

const TEXT =
  "When this creature enters, each opponent sacrifices a permanent of their choice unless they pay {2}.";

export default defineCard({
  name: "Rishadan Footpad",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        ifDidnt: { kind: "sacrifice", who: "that-player", filter: {}, count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
