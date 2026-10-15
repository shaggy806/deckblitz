import { defineCard } from "../define.js";

// EDHREC rank 26432.

const TEXT =
  "Whenever this creature becomes tapped, you gain 1 life and scry 1. (Look at the top card of your library. You may put that card on the bottom.)";

export default defineCard({
  name: "Wakandan Tusker",
  manaCost: "{1}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
