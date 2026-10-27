import { defineCard } from "../define.js";

// EDHREC rank 22000.

export default defineCard({
  name: "Earsplitting Rats",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, each player discards a card.\nDiscard a card: Regenerate this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: "When this creature enters, each player discards a card.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Discard a card: Regenerate this creature.",
    },
  ],
});
