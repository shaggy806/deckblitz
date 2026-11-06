import { defineCard } from "../define.js";

// EDHREC rank 32680.

export default defineCard({
  name: "Fugitive Listener",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["El-Aurian", "Scout"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, each opponent discards a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "When this creature enters, each opponent discards a card.",
    },
  ],
});
