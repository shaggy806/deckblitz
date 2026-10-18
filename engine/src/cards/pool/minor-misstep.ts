import { defineCard } from "../define.js";

// EDHREC rank 14935.
//
// Rulings:
//   [2023-02-04] While a spell with {X} in its mana cost is on the stack, use the value of X that
//     was chosen when it was cast to determine its mana value. Normally, this means that a spell
//     with {X} in its mana cost will have a mana value greater than 1.

export default defineCard({
  name: "Minor Misstep",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell with mana value 1 or less.",
  targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 1 } } }],
  effect: { kind: "counter", target: 0 },
});
