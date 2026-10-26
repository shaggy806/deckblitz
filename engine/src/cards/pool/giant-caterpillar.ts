import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 27622.
//
// Rulings:
//   It used to make Butterfly tokens. Now it makes Insect tokens named Butterfly.

const TEXT =
  "{G}, Sacrifice this creature: Create a 1/1 green Insect creature token with flying named Butterfly at the beginning of the next end step.";

export default defineCard({
  name: "Giant Caterpillar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "create-token", token: "Butterfly Token", count: 1 },
        text: "Create a 1/1 green Insect creature token with flying named Butterfly.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
