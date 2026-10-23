import { defineCard } from "../define.js";

// EDHREC rank 28300.
//
// Rulings:
//   [2016-07-13] Because Galvanic Bombardment is still on the stack as you determine the value of
//     X, it is not in your graveyard and will not add to the value of X.
//
// Ancestral Anger's count of its namesakes in your graveyard, plus 2.
export default defineCard({
  name: "Galvanic Bombardment",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Galvanic Bombardment deals X damage to target creature, where X is 2 plus the number of cards named Galvanic Bombardment in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    amount: { sum: [2, { countInGraveyard: { name: "Galvanic Bombardment", ownedBy: "you" } }] },
    target: 0,
  },
});
