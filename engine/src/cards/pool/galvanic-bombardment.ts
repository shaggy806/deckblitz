import { defineCard } from "../define.js";

// EDHREC rank 28300.
//
// It's on the stack as X is read, so it doesn't count itself (its ruling).

export default defineCard({
  name: "Galvanic Bombardment",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Galvanic Bombardment deals X damage to target creature, where X is 2 plus the number of cards named Galvanic Bombardment in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: { sum: [2, { countInGraveyard: { name: "Galvanic Bombardment", ownedBy: "you" } }] },
  },
});
