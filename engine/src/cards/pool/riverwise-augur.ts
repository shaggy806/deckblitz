import { defineCard } from "../define.js";

// EDHREC rank 16856.

export default defineCard({
  name: "Riverwise Augur",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, draw three cards, then put two cards from your hand on top of your library in any order.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: "When this creature enters, draw three cards, then put two cards from your hand on top of your library in any order.",
    },
  ],
});
