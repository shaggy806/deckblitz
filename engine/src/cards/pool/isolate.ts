import { defineCard } from "../define.js";

// EDHREC rank 26255.
//
// Rulings:
//   A permanent with {X} in its mana cost has X = 0.

export default defineCard({
  name: "Isolate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target permanent with mana value 1.",
  targets: [{ kind: "permanent", filter: { manaValue: { op: "eq", n: 1 } } }],
  effect: { kind: "exile", target: 0 },
});
