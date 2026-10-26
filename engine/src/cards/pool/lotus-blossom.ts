import { defineCard } from "../define.js";

// EDHREC rank 11918.
//
// Rulings:
//   [2004-10-04] Adding a counter is optional. If you forget to add one during your upkeep, you
//     cannot back up and add one later.
//
// X is read off the sacrificed artifact as it last existed (rule 608.2h), as
// Magma Mine's is.

export default defineCard({
  name: "Lotus Blossom",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "At the beginning of your upkeep, you may put a petal counter on this artifact.\n{T}, Sacrifice this artifact: Add X mana of any one color, where X is the number of petal counters on this artifact.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { countersOn: "source", counter: "petal" } },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Add X mana of any one color, where X is the number of petal counters on this artifact.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a petal counter on Lotus Blossom?",
        effect: { kind: "add-counter", target: "source", counter: "petal", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a petal counter on this artifact.",
    },
  ],
});
