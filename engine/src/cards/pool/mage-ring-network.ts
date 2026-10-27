import { defineCard } from "../define.js";

// EDHREC rank 4454.

export default defineCard({
  name: "Mage-Ring Network",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Put a storage counter on this land.\n{T}, Remove any number of storage counters from this land: Add {C} for each storage counter removed this way.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "storage", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Put a storage counter on this land.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "storage", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: "x" },
      resolve: null,
      text: "{T}, Remove any number of storage counters from this land: Add {C} for each storage counter removed this way.",
    },
  ],
});
