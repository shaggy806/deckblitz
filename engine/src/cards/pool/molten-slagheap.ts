import { defineCard } from "../define.js";

// EDHREC rank 8679.

export default defineCard({
  name: "Molten Slagheap",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Put a storage counter on this land.\n{1}, Remove X storage counters from this land: Add X mana in any combination of {B} and/or {R}.",
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
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: "x" },
      resolve: null,
      text: "{1}, Remove X storage counters from this land: Add X mana in any combination of {B} and/or {R}.",
    },
  ],
});
