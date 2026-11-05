import { defineCard } from "../define.js";

// EDHREC rank 30541.

export default defineCard({
  name: "Chimney Imp",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, target opponent puts a card from their hand on top of their library.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
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
      text: "When this creature dies, target opponent puts a card from their hand on top of their library.",
    },
  ],
});
