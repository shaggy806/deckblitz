import { defineCard } from "../define.js";

// Antiquities/Legends Mana Battery. // EDHREC rank 28083.
//
// Rulings:
//   Can be tapped even if it has no counters.
//
// X is the counters removed, announced as it is activated (0 allowed).

export default defineCard({
  name: "Green Mana Battery",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Put a charge counter on this artifact.\n{T}, Remove any number of charge counters from this artifact: Add {G}, then add an additional {G} for each charge counter removed this way.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "{2}, {T}: Put a charge counter on this artifact.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { sum: [1, "x"] } },
      resolve: null,
      text: "{T}, Remove any number of charge counters from this artifact: Add {G}, then add an additional {G} for each charge counter removed this way.",
    },
  ],
});
