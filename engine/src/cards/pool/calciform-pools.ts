import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 11448.
//
// Molten Slagheap's storage land, in white and blue.
export default defineCard({
  name: "Calciform Pools",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Put a storage counter on this land.\n{1}, Remove X storage counters from this land: Add X mana in any combination of {W} and/or {U}.",
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
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "storage", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: "x" },
      resolve: null,
      text: "{1}, Remove X storage counters from this land: Add X mana in any combination of {W} and/or {U}.",
    },
  ],
});
