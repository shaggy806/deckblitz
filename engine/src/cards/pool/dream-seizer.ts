import { defineCard } from "../define.js";

// EDHREC rank 17741.

export default defineCard({
  name: "Dream Seizer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you may blight 1. If you do, each opponent discards a card. (To blight 1, put a -1/-1 counter on a creature you control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 1?",
        effect: { kind: "blight", amount: 1 },
        then: { kind: "discard", target: "each-opponent", amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, you may blight 1. If you do, each opponent discards a card.",
    },
  ],
});
