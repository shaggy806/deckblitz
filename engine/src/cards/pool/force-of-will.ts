import { defineCard } from "../define.js";

// EDHREC rank 201.
//
// Rulings:
//   [2022-12-08] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as the alternative cost of Force of Will), add any cost increases,
//     then apply any cost reductions. Force of Will's mana value is always 5, no matter what you
//     paid to cast it.

export default defineCard({
  name: "Force of Will",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target spell.",
  alternativeCost: { mana: "{0}", payLife: 1, exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" } },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
