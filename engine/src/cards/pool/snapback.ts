import { defineCard } from "../define.js";

// EDHREC rank 4109.
//
// Rulings:
//   [2021-03-19] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying (such as the alternative cost of Snapback), add any cost increases, then
//     apply any cost reductions. The mana value of the spell is determined by only its mana cost,
//     no matter what the total cost to cast that spell was.

export default defineCard({
  name: "Snapback",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may exile a blue card from your hand rather than pay this spell's mana cost.\nReturn target creature to its owner's hand.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" } },
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
});
