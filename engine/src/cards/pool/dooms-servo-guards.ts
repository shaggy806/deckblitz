import { defineCard } from "../define.js";

// EDHREC rank 22205.

export default defineCard({
  name: "Doom's Servo-Guards",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, you gain 2 life and mill two cards. (Put the top two cards of your library into your graveyard.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "mill", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: "When this creature enters, you gain 2 life and mill two cards.",
    },
  ],
});
