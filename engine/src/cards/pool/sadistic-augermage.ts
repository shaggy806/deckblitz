import { defineCard } from "../define.js";

const TEXT = "When this creature dies, each player puts a card from their hand on top of their library.";

export default defineCard({
  name: "Sadistic Augermage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
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
