import { defineCard } from "../define.js";

// EDHREC rank 20376.
//
// Rulings:
//   [2019-06-14] While resolving Excavating Anurid's triggered ability, you can't sacrifice
//     multiple lands to draw multiple cards.

export default defineCard({
  name: "Excavating Anurid",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, you may sacrifice a land. If you do, draw a card.\nThreshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has vigilance.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        ifDid: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: "When this creature enters, you may sacrifice a land. If you do, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1 and has vigilance.",
    },
  ],
});
