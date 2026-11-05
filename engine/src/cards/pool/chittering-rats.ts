import { defineCard } from "../define.js";

// EDHREC rank 18447.

const TEXT = "When this creature enters, target opponent puts a card from their hand on top of their library.";

export default defineCard({
  name: "Chittering Rats",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: 1,
          max: 1,
          destination: "library-top",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
