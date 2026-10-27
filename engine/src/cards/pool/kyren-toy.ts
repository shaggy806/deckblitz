import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25774. The Mana Batteries' shape:
// X is the counters removed, announced as it is activated (0 allowed).

const CHARGE = "{1}, {T}: Put a charge counter on this artifact.";
const MANA = "{T}, Remove X charge counters from this artifact: Add an amount of {C} equal to X plus one.";

export default defineCard({
  name: "Kyren Toy",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE}\n${MANA}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE,
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: "x" } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { sum: ["x", 1] } },
      resolve: null,
      text: MANA,
    },
  ],
});
