import { defineCard } from "../define.js";

// EDHREC rank 18327.

export default defineCard({
  name: "Vault Plunderer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, target player draws a card and loses 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, target: 0 },
          { kind: "lose-life", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: "When this creature enters, target player draws a card and loses 1 life.",
    },
  ],
});
